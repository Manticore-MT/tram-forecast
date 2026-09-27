"""Compare daily demand models, with fixed historical hourly profiles.

Models are fitted strictly before each origin. Routes and dates share no future
target information. Quantile loss directly targets absolute error, unlike log MSE.
"""
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import QuantileRegressor
from app.engine import ROUTES
from external_factor_experiment import load_history, matrix, ridge
from hourly_factor_experiment import dense_labels, fit_base, metrics

ROOT = Path(__file__).resolve().parent
MODES = ("effective_calendar_log", "route_weekday_log", "absolute_median", "route_weekday_median", "recent_median")


def design(frame, detailed, effective=False):
    x = matrix(frame, None, None, "base", True)
    if effective:
        start = 3*len(ROUTES)
        x[:, start:start+6] = np.array([[int(r.effective_dow==d) for d in range(1,7)] for r in frame.itertuples()])
    if detailed:
        extra = np.array([[int(r.route==route and r.effective_dow==dow)
                           for route in ROUTES for dow in range(7)] for r in frame.itertuples()])
        x = np.column_stack([x, extra])
    return x


def forecast(filtered, raw, origin, days):
    _, train = load_history(filtered, origin)
    _, f = fit_base(filtered, origin, days)
    _, orig = fit_base(raw, origin, days)
    daily = f.drop_duplicates(["route","date"]).copy()
    night = f.hour.lt(6).to_numpy()
    f["champion"] = np.where(night, orig.ridge, f.ridge)
    scales = train.groupby("route").boardings.median()
    for mode in MODES:
        detailed = mode.startswith("route_weekday")
        xt, xf = design(train,detailed,mode=="effective_calendar_log"), design(daily,detailed,mode=="effective_calendar_log")
        if mode.endswith("log"):
            y = np.log1p(train.boardings.to_numpy())
            coef, intercept = ridge(xt,y,1.)
            pred_train = xt@coef+intercept
            residual = pd.Series(y-pred_train,index=train.index)
            recent = train.date >= origin-pd.Timedelta(days=28)
            correction = residual[recent].groupby(train.loc[recent,"route"]).median()
            totals = np.expm1(xf@coef+intercept+daily.route.map(correction).fillna(0).to_numpy())
        else:
            scale = train.route.map(scales).to_numpy()
            y = train.boardings.to_numpy()/scale
            weights = scale/scale.mean()
            if mode == "recent_median":
                weights *= np.exp2(-(origin-train.date).dt.days.to_numpy()/90.)
            model = QuantileRegressor(quantile=.5,alpha=.001,solver="highs")
            model.fit(xt,y,sample_weight=weights)
            residual = pd.Series(y-model.predict(xt),index=train.index)
            recent = train.date >= origin-pd.Timedelta(days=28)
            correction = residual[recent].groupby(train.loc[recent,"route"]).median()
            totals = (model.predict(xf)+daily.route.map(correction).fillna(0).to_numpy())*daily.route.map(scales).to_numpy()
        daily["ratio"] = np.maximum(0,totals)/daily.daily_base.clip(lower=1)
        ratios = daily.set_index(["route","date"]).ratio.reindex(pd.MultiIndex.from_frame(f[["route","date"]])).to_numpy()
        f[mode] = f.ridge*ratios
        f.loc[night | f.closed50.to_numpy(),mode] = f.loc[night | f.closed50.to_numpy(),"champion"]
        f[mode+"_half"] = .5*f[mode]+.5*f.champion
    return f


def main():
    raw, filtered = dense_labels(), dense_labels(True)
    report = dict(protocol="Daily model comparisons. Frozen calendar features; pre-origin labels only. Overlapping validation windows, not independent tests.",results={})
    modes = [m for mode in MODES for m in (mode, mode+"_half")]
    for start,days in [("2025-05-01",61),("2025-07-01",61),("2025-08-01",61),("2025-09-01",61),("2025-10-01",31)]:
        f = forecast(filtered,raw,pd.Timestamp(start),days)
        actual = raw.set_index(["route","date","hour"]).boardings
        f["boardings"] = actual.reindex(pd.MultiIndex.from_frame(f[["route","date","hour"]])).fillna(0).to_numpy()
        report["results"][start] = {mode:dict(overall=metrics(f,f[mode]),byRoute={str(r):metrics(g,g[mode]) for r,g in f.groupby("route")}) for mode in ["champion"]+modes}
        print(start,{m:round(v["overall"]["score"],6) for m,v in report["results"][start].items()},flush=True)
        (ROOT/"reference/daily_structure_metrics.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    eligible=[]
    for mode in modes:
        gains=[v[mode]["overall"]["score"]-v["champion"]["overall"]["score"] for v in report["results"].values()]
        if gains[-1]>.001 and sum(g>0 for g in gains[:4])>=3 and np.mean(gains)>0:
            eligible.append((float(np.mean(gains)),mode))
    report["eligible"]=eligible
    if eligible:
        selected=max(eligible)[1]
        f=forecast(filtered,raw,pd.Timestamp("2025-11-01"),61)
        lookup=f.set_index(["route","date","hour"])[selected]
        template=pd.read_csv(ROOT/"reference/submission_service_dates_candidate.csv",sep=";")
        for i,row in template.iterrows():
            d=pd.Timestamp(row.date)
            if row.hour<6 or row.route==5 or (row.route==50 and d.dayofweek>=5):
                continue
            template.loc[i,"prediction"]=max(0,int(np.rint(lookup.loc[(row.route,d,row.hour)])))
        template.to_csv(ROOT/"reference/submission_daily_structure_candidate.csv",sep=";",index=False)
        report["selected"]=selected
    (ROOT/"reference/daily_structure_metrics.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print('Eligible:',eligible,flush=True)


if __name__ == "__main__":
    main()
