import { App } from 'obsidian';
import { Dispatch, Fragment, useEffect, useRef, useState } from 'react';
import FadeInOut from 'src/components/FadeInOut';
import useMarkdownRenderer from 'src/hooks/useMarkdownRenderer';
import { LifeinweeksView } from 'src/LifeinweeksView';

type Event = {
    date: string;
    name: string;
    desc?: string;
}

type WeekBoxProps = {
  weekDate: number;
  firstDayOfTheWeek: string;
  events: Event[];
  lockedBox: number | null;
  setLockedBox: (value: number | null) => void;
  containerRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  app: App;
  view: LifeinweeksView;
  path: string;
}

const WeekBox = ({ 
  weekDate,
  firstDayOfTheWeek,
  events,
  lockedBox, 
  setLockedBox,
  containerRefs,
  app,
  view,
  path
}: WeekBoxProps) => {
  const [eventDescHtmls, setEventDescHtmls] = useState<Record<string, string> | null>(null);

  const [isHovered, setIsHovered] = useState(false);

  const isLocked = lockedBox === weekDate;
  const isVisible = isHovered || isLocked;

  return (
    <div 
      className="liw__weekBox"
      data-date={weekDate}
      ref={el => { containerRefs.current[weekDate] = el; }}
      onMouseEnter={() => !lockedBox && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isLocked && setLockedBox(weekDate)}
    >
      {events.map((event, i) => {
        return (
            <span key={i} className="liw__eventMarker">{event.name}</span>
        );
      })}

      <FadeInOut show={isVisible} duration={100} className={`liw__boxPopup ${isLocked ? "liw__boxPopup__isLocked" : ""}`}>
        <div className="liw__boxPopup__arrow"></div>
        <div className="liw__boxPopup__content">
          {/* If there are events, render all the markdown descriptions to html and cache
              their innerHTML so that next time i just iterate through events and
              dangerously set the innerHTML from the cache */}
            {(isVisible && events.length > 0) ? 
              (!eventDescHtmls ? <RenderEventDescriptions 
                events={events}
                setEventDescHtmls={setEventDescHtmls}
                app={app} 
                view={view} 
                path={path} />
              : events.map(event => (
                <Fragment key={event.date}>
                  <div className="liw__boxPopup__content__header">{event.date}</div>
                  {event.desc && eventDescHtmls[event.date] && 
                    <div className="liw__boxPopup__content__desc" dangerouslySetInnerHTML={{__html: eventDescHtmls[event.date]}}>
                    </div>}
                </Fragment>
              )))
            : <div className="liw__boxPopup__content__header">{firstDayOfTheWeek}</div>}
        </div>
      </FadeInOut>
    </div>
  );
};

export default WeekBox;


type RenderEventDescriptionsProps = {
  events: Event[];
  setEventDescHtmls: Dispatch<React.SetStateAction<Record<string, string> | null>>;
  app: App;
  view: LifeinweeksView;
  path: string;
}

const RenderEventDescriptions = ({ events, setEventDescHtmls, app, view, path }: RenderEventDescriptionsProps) => {
  const eventDescRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const { render, ref } = useRef(useMarkdownRenderer(app, view)).current;

  // Render markdown when popup becomes visible
  useEffect(() => {
    let isMounted = true;

    
    (async () => {
      const eventDescHtmls: Record<string, string> = {};

      const promises = events.map(async event => {
        if (!event.desc) return;
        
        const eventRef = eventDescRefs.current[event.date];
        if (!eventRef) return;

        try {
          if (eventRef) {
          ref.current = eventRef;
          if (isMounted) {
            await render(path, event.desc);
            eventDescHtmls[event.date] = eventRef.innerHTML;
          }
          }
        } catch (error) {
          console.error('Error loading markdown description:', error);
        }
      });

      await Promise.all(promises);
      setEventDescHtmls(eventDescHtmls);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return events.map(event => (
    <Fragment key={event.date}>
      <div className="liw__boxPopup__content__header">
        {event.date}
      </div>
      {event.desc && <div ref={el => { eventDescRefs.current[event.date] = el; }} className="liw__boxPopup__content__desc">
        </div>}
    </Fragment>
  ));
}
