"""Learn route-7 restricted weekend profiles without target-period labels."""
import json
from pathlib import Path
import numpy as np
import pandas as pd
from hourly_factor_experiment import dense_labels, fit_base, metrics

ROOT=Path(__file__).resolve().parent


def profile(labels, origin):
    # Fully observed Sep-Oct service regime. No October labels at October origin.
    h=labels[(labels.route==7)&(labels.date>="2025-09-06")&(labels.date<origin)&(labels.hour>=6)].copy()
    h["dow"]=h.date.dt.dayofweek
    h=h[h.dow>=5]
    grid=pd.MultiIndex.from_product([sorted(h.date.unique()),range(6,24)],names=["date","hour"])
    h=h.set_index(["date","hour"])[["boardings"]].reindex(grid,fill_value=0).reset_index()
    h["dow"]=h.date.dt.dayofweek
    return h.groupby(["dow","hour"]).boardings.median()


def main():
    filtered,raw=dense_labels(True),dense_labels()
    report=dict(sourceUrls=["https://t.me/DtOperativno/22627","https://t.me/DtOperativno/23565"],
                method="Route 7 restricted weekend hourly medians, separate Saturday/Sunday; only pre-origin labels.",
                platformScore=0.89200, scoreProvenance="reported_by_team_for_this_configuration", validation={})
    for start,days in [("2025-09-20",11),("2025-10-01",31)]:
        origin=pd.Timestamp(start)
        _,f=fit_base(filtered,origin,days)
        _,original=fit_base(raw,origin,days)
        f["before"]=np.where(f.hour<6,original.ridge,f.ridge)
        f["after"]=f.before.copy()
        actual=raw.set_index(["route","date","hour"]).boardings
        f["boardings"]=actual.reindex(pd.MultiIndex.from_frame(f[["route","date","hour"]])).fillna(0).to_numpy()
        p=profile(filtered,origin)
        mask=(f.route==7)&(f.dow>=5)&(f.hour>=6)
        f.loc[mask,"after"]=[p.loc[(r.dow,r.hour)] for r in f[mask].itertuples()]
        report["validation"][start]={"days":days,"before":metrics(f,f.before),"after":metrics(f,f.after),
            "affectedBefore":metrics(f[mask],f.loc[mask,"before"]),"affectedAfter":metrics(f[mask],f.loc[mask,"after"])}
    template=pd.read_csv(ROOT/"reference/submission_service_dates_candidate.csv",sep=";")
    p=profile(filtered,pd.Timestamp("2025-11-01"))
    changes=[]
    for i,row in template.iterrows():
        d=pd.Timestamp(row.date)
        if row.route==7 and d<pd.Timestamp("2025-11-15") and d.dayofweek>=5 and row.hour>=6:
            value=int(np.rint(p.loc[(d.dayofweek,row.hour)]))
            changes.append(dict(date=row.date,hour=int(row.hour),before=int(row.prediction),after=value))
            template.loc[i,"prediction"]=value
    assert len(template)==14640 and len(changes)==72 and template.prediction.ge(0).all()
    output=ROOT/"reference/submission_service7_candidate.csv"
    template.to_csv(output,sep=";",index=False)
    report["candidate"]=output.name
    report["changes"]=changes
    report["changeInTotal"]=sum(c["after"]-c["before"] for c in changes)
    report["limitations"]="Only 4 November weekends days, not a promise of 0.92. Holidays Nov2 and working Sat Nov1 treated by physical restriction schedule. No correction after Nov15; nights and route50 preserved."
    output.with_suffix(".json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k!='changes'},indent=2))


if __name__=="__main__":
    main()
