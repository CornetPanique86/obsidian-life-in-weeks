import { LifeEntries, LifeinweeksConfig } from '../../utils/markdownParser';
import "src/styles.scss";
import { LifeinweeksView } from 'src/LifeinweeksView';
import WeekBox from 'src/components/CustomViewContent/WeekBox';
import { App } from 'obsidian';
import { Fragment, useEffect, useRef, useState } from 'react';

const TODAY = new Date();
const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { timeZone: "UTC" });

interface Props {
    title: string;
    lifeEntries: LifeEntries;
    config: LifeinweeksConfig;
    app: App;
    view: LifeinweeksView;
    path: string;
}

const CustomViewContent = ({ title, lifeEntries, config, app, view, path }: Props) => {
    const [lockedBox, setLockedBox] = useState<number | null>(null);
    const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Close popup when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const isOutside = Object.values(containerRefs.current).every(
          (ref) => ref && !ref.contains(e.target as Node)
        );
        if (isOutside) {
          setLockedBox(null);
        } else if ((e.target as HTMLElement).classList.contains("internal-link")) {
          const el = e.target as HTMLAnchorElement;
          const href = el.getAttribute('data-href');
          if (!href) return;
          const destination = app.metadataCache.getFirstLinkpathDest(href, path);
          if (!destination) {
            el.classList.add('is-unresolved');
            return;
          }

          app.workspace.openLinkText(href, path);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const startDate = config.startDate || '2000-01-01';
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const endYear = config.endYear || startDate ? parseInt(startDate.split("-")[0]) + 100 : 2100;
    const showBirthday = config.birthday?.show ?? true;
    const birthdayDate = (config.birthday?.date && config.birthday.date.length === 10 ? config.birthday.date.substring(5) : config.birthday?.date) || '01-01';
    const birthdayText = config.birthday?.text || "🎂 %s";
    const decades = config.decades || {};

    return (
      <div className="liw">
        <h1>{title}</h1>
        <div className="liw__grid">
          {Array.from({ length: Math.floor((endYear - startYear) / 10) + 1 }, (_, decade) => {
            return (
              <Fragment key={decade}>
                <h2 className="liw__decadeHeader">{decades[decade] ? decades[decade] : `${decade}0s`}</h2>
                <div className="liw__decadeContainer">
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = startYear + decade * 10 + i;
                    if (year > endYear) return null;

                    const thisYear = year + "-" + startMonth + "-" + startDay;
                    const nextYear = (year + 1) + "-" + startMonth + "-" + startDay;
                    const age = year - startYear;

                    return (
                      <Fragment key={year}>
                        <div className="liw__newYearBox">{year}</div>
                        {Array.from({ length: 52 }, (_, week) => {
                          const weekDate = new Date(thisYear).getTime() + (week * 604800000);

                          let firstDayOfTheWeek: null | string = null;

                          const events = [];
                          for (let day = 0; day < 7; day++) {
                            const specificDate = new Date(thisYear);
                            specificDate.setDate(specificDate.getDate() + (week * 7) + day);
                            const dateString = specificDate.toISOString().split('T')[0];
                            const dateLocale = DATE_FORMAT.format(specificDate);

                            if (!firstDayOfTheWeek) firstDayOfTheWeek = dateLocale;

                            if (dateString >= nextYear) return null;

                            if (showBirthday) {
                              // Remove the first 5 characters to get MM-DD
                              const mmdd = dateString.substring(5);
                              const isBirthday = mmdd === birthdayDate;
                              if (isBirthday) events.push({
                                date: dateLocale,
                                name: birthdayText.replace('%s', age.toString()),
                              });
                            }
                            
                            const event = lifeEntries[dateString] || null;
                            if (event) events.push({
                              date: dateLocale,
                              name: event.name,
                              desc: event.desc
                            });
                          }

                          return (TODAY > new Date(weekDate)) ? <WeekBox
                              key={weekDate}
                              weekDate={weekDate}
                              firstDayOfTheWeek={firstDayOfTheWeek || "Date not found"}
                              events={events}
                              lockedBox={lockedBox}
                              setLockedBox={setLockedBox}
                              containerRefs={containerRefs}
                              app={app}
                              view={view}
                              path={path}
                            />
                            : <div key={weekDate} className="liw__weekBox liw__futureDate"></div>;
                        })}
                      </Fragment>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    )
    
    // return <div className='example-plugin-container'>
    //     <h2>{title}</h2>

    //     {Object.entries(lifeEntries).map(([date, entry]) => {
            // const { render, ref } = useMarkdownRenderer(app, view);

            // useEffect(() => {
            //     let isMounted = true;
            
            //     const loadAndRenderContent = async () => {
            //       try {
            //         if (isMounted) {
            //           await render(path, entry.desc);
            //         }
            //       } catch (error) {
            //         console.error('Error loading markdown description:', error);
            //       }
            //     };

            //     loadAndRenderContent();

            //     return () => {
            //       isMounted = false;
            //     };
            //   }, [path, entry.desc, render]);

    //         return (
    //             <div key={date} className="life-entry">
    //                 <h3>{date} - {entry.name}</h3>
    //                 <div ref={ref} className="entry-description">
    //                 </div>
    //             </div>
    //         )
    //     })}
        
    //     {Object.keys(parsedEntries).length === 0 && (
    //         <div>
    //             <p>No entries found. Add entries using the format:</p>
    //             <pre>## YYYY-MM-DD Title{'\n'}Description content</pre>
    //         </div>
    //     )}
    // </div>;
}

export default CustomViewContent;
