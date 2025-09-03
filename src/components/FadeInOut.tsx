import { Component, CSSProperties, ReactNode, forwardRef, Ref } from "react";

const UNMOUNTED = "unmounted";
const EXITED = "exited";
const ENTERING = "entering";
const ENTERED = "entered";
const EXITING = "exiting";

type TransitionStatus = typeof UNMOUNTED | typeof EXITED | typeof ENTERING | typeof ENTERED | typeof EXITING;

interface Props {
  show: boolean;
  duration: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface State {
  status: TransitionStatus;
}

const transitionStyles: Record<TransitionStatus, CSSProperties> = {
  unmounted: {},
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 }
};

class FadeInOutInner extends Component<Props & { forwardedRef?: Ref<HTMLDivElement> }, State> {
  constructor(props: Props & { forwardedRef?: Ref<HTMLDivElement> }) {
    super(props);
    this.state = { status: UNMOUNTED };
  }

  componentDidMount(): void {
    const { show } = this.props;
    if (show) {
      this.performEnter();
    }
  }

  componentDidUpdate(prevProps: Props): void {
    let nextStatus: TransitionStatus | null = null;
    if (prevProps.show !== this.props.show) {
      const { status } = this.state;
      if (this.props.show) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING;
        }
      } else {
        if (status === ENTERING || status === ENTERED) {
          nextStatus = EXITING;
        }
      }
    }
    this.updateStatus(nextStatus);
  }

  updateStatus(nextStatus: TransitionStatus | null): void {
    if (nextStatus !== null) {
      if (nextStatus === ENTERING) {
        this.performEnter();
      } else {
        this.performExit();
      }
    } else if (this.state.status === EXITED) {
      this.setState({ status: UNMOUNTED });
    }
  }

  performEnter(): void {
    this.setState({ status: ENTERING }, () => {
      setTimeout(() => {
        this.setState({ status: ENTERED });
      }, 0);
    });
  }

  performExit(): void {
    const { duration } = this.props;
    this.setState({ status: EXITING }, () => {
      setTimeout(() => {
        this.setState({ status: EXITED });
      }, duration);
    });
  }

  render(): ReactNode {
    const { status } = this.state;
    if (status === UNMOUNTED) return null;

    const { children, duration, className, style, forwardedRef } = this.props;

    return (
      <div
        ref={forwardedRef}
        className={className}
        style={{
          ...style,
          transition: `opacity ${duration}ms ease-in-out`,
          ...transitionStyles[status]
        }}
      >
        {children}
      </div>
    );
  }
}

// ✅ Wrap with forwardRef
const FadeInOut = forwardRef<HTMLDivElement, Props>((props, ref) => (
  <FadeInOutInner {...props} forwardedRef={ref} />
));

export default FadeInOut;
