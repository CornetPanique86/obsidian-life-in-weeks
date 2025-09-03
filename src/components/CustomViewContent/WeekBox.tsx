import { App } from 'obsidian';
import { Dispatch, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import FadeInOut from 'src/components/FadeInOut';
import useMarkdownRenderer from 'src/hooks/useMarkdownRenderer';
import { LifeinweeksView } from 'src/LifeinweeksView';

type Position = "center" | "left" | "right";

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

  const [position, setPosition] = useState<Position>("center");
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const measureAndPlace = useCallback(() => {
    const boxRef = containerRefs.current[weekDate];
    const viewportDiv = document.querySelector(".view-content");
    if (!isVisible || !viewportDiv || !boxRef || !popoverRef.current) return;

    const boxRect = boxRef.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    // The Obsidian div that contains the view
    const viewportRect = viewportDiv.getBoundingClientRect();

    // Where the popover edges would land if centered under the trigger
    const centerX = boxRect.left + boxRect.width / 2;
    const popoverLeft = centerX - popoverRect.width / 2;
    const popoverRight = centerX + popoverRect.width / 2;

    // If popover is wider than viewport, just pin left (and rely on maxWidth)
    if ((popoverRect.width >= viewportDiv.clientWidth) || (popoverLeft < viewportRect.left)) setPosition("left");
    else if (popoverRight > viewportRect.right) setPosition("right");
    else setPosition("center");
  }, [isVisible]);

  // Callback ref: runs exactly when the DOM node mounts/changes
  const setPopoverNode = useCallback((node: HTMLDivElement | null) => {
    popoverRef.current = node;
    if (node && isVisible) {
      // Wait for it to mount & layout to settle
      requestAnimationFrame(() => {
        requestAnimationFrame(measureAndPlace);
      });
    }
  }, [isVisible, measureAndPlace]);

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

      <FadeInOut 
        ref={setPopoverNode} 
        show={isVisible} duration={100} 
        className={`liw__boxPopup ${isLocked ? "liw__boxPopup__isLocked" : ""} liw__boxPopup__${position}`}>
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
              : events.map((event, i) => (
                <Fragment key={i}>
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

  return <Fragment>
    {events.map((event, i) => (
      <Fragment key={i}>
        <div className="liw__boxPopup__content__header">
          {event.date}
        </div>
        {event.desc && <div ref={el => { eventDescRefs.current[event.date] = el; }} className="liw__boxPopup__content__desc">
          </div>}
      </Fragment>
    ))}
  </Fragment>
}
