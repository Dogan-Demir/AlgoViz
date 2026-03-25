export interface TourStep {
  id: string;
  target: string;             // matches data-tour="<id>" on the DOM element
  page: string;               // pathname to navigate to if not already there
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'algorithm-list',
    target: 'algorithm-list',
    page: '/algorithms',
    title: 'Browse Algorithms',
    content: 'Here are all the available algorithms. Each card shows the category and complexity at a glance.',
    placement: 'bottom',
  },
  {
    id: 'algorithm-card',
    target: 'algorithm-card',
    page: '/algorithms',
    title: 'Pick an Algorithm',
    content: 'Click any card to open the visualiser for that algorithm. Try Bubble Sort to start.',
    placement: 'bottom',
  },
  {
    id: 'visualizer',
    target: 'visualizer',
    page: '/algorithms/bubble-sort',
    title: 'Watch It Run',
    content: 'This area shows the algorithm executing in real time — elements are highlighted as they are compared and swapped.',
    placement: 'bottom',
  },
  {
    id: 'input-panel',
    target: 'input-panel',
    page: '/algorithms/bubble-sort',
    title: 'Set Your Input',
    content: 'Enter your own numbers or click Random, then hit Run to start the visualisation.',
    placement: 'left',
  },
  {
    id: 'playback-controls',
    target: 'playback-controls',
    page: '/algorithms/bubble-sort',
    title: 'Control Playback',
    content: 'Play, pause, or step through one action at a time. Use the arrow keys or drag the progress bar.',
    placement: 'top',
  },
  {
    id: 'pseudocode-panel',
    target: 'pseudocode-panel',
    page: '/algorithms/bubble-sort',
    title: 'Follow the Code',
    content: 'The highlighted line tracks exactly where you are in the algorithm as each step runs.',
    placement: 'left',
  },
  {
    id: 'help-button',
    target: 'help-button',
    page: '/algorithms',
    title: "You're All Set!",
    content: 'Click this button any time to replay this tour. New features will be added here as the platform grows.',
    placement: 'bottom',
  },
];
