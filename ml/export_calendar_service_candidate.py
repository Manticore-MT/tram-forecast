"""Use effective-weekday daily model only on explicitly exceptional calendar days."""
import json
from pathlib import Path
import numpy as np
import pandas as pd
from daily_structure_experiment import forecast
from hourly_factor_experiment import dense_labels,metrics
from app.engine import calendar_fields

ROOT=Path(__file__).resolve().parent


def main():
    raw,filtered=dense_labels(),dense_labels(True)
    report=dict(method="Effective-weekday Ridge on holiday/short days only; normal dates unchanged. Combines with separately validated route7 restriction.",results={},platformScore=0.89212,scoreProvenance="reported_by_team_for_this_configuration")
    for start,days in [("2025-05-01",61),("2025-06-01",30)]:
        f=forecast(filtered,raw,pd.Timestamp(start),days)
        actual=raw.set_index(["route","date","hour"]).boardings
        f["boardings"]=actual.reindex(pd.MultiIndex.from_frame(f[["route","date","hour"]])).fillna(0).to_numpy()
        mask=(f.holiday.eq(1)|f.shortday.eq(1))&f.hour.ge(6)&~f.closed50
        f["conditional"]=np.where(mask,f.effective_calendar_log,f.champion)
        report["results"][start]=dict(before=metrics(f,f.champion),after=metrics(f,f.conditional),
            affectedBefore=metrics(f[mask],f.loc[mask,"champion"]),affectedAfter=metrics(f[mask],f.loc[mask,"conditional"]))
    eligible=all(v["after"]["score"]>v["before"]["score"] for v in report["results"].values())
    report["eligible"]=eligible
    if eligible:
        f=forecast(filtered,raw,pd.Timestamp("2025-11-01"),61)
        lookup=f.set_index(["route","date","hour"]).effective_calendar_log
        template=pd.read_csv(ROOT/"reference/submission_service7_candidate.csv",sep=";")
        changes=[]
        for i,row in template.iterrows():
            d=pd.Timestamp(row.date)
            c=calendar_fields(d.date())
            protected=(row.route==50 and d.dayofweek>=5) or (row.route==7 and d.dayofweek>=5 and d<pd.Timestamp("2025-11-15"))
            if row.route==5 or row.hour<6 or protected or not (c['holiday'] or c['shortday']):
                continue
            value=max(0,int(np.rint(lookup.loc[(row.route,d,row.hour)])))
            changes.append(dict(route=int(row.route),date=row.date,hour=int(row.hour),before=int(row.prediction),after=value))
            template.loc[i,"prediction"]=value
        output=ROOT/"reference/submission_calendar_service_candidate.csv"
        template.to_csv(output,sep=";",index=False)
        report["candidate"]=output.name
        report["changes"]=changes
    (ROOT/"reference/calendar_service_metrics.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k!='changes'},indent=2))


if __name__=="__main__":
    main()
