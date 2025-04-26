const noop = (props: any) => props.children;

// Placeholder implementation since we can't import framer-motion directly
export const motion = {
  div: noop,
  button: noop,
  span: noop,
  p: noop,
  a: noop,
  ul: noop,
  li: noop,
  section: noop,
  header: noop,
  footer: noop,
  main: noop,
  nav: noop,
  form: noop,
  input: noop,
  textarea: noop,
  select: noop,
  option: noop,
  img: noop,
  svg: noop,
  path: noop,
  circle: noop,
  rect: noop,
};

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => children;