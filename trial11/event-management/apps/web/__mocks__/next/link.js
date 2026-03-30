const React = require('react');
const Link = React.forwardRef(function Link({ children, href, ...props }, ref) {
  return React.createElement('a', { ...props, href, ref }, children);
});
Link.displayName = 'Link';
module.exports = Link;
module.exports.default = Link;
