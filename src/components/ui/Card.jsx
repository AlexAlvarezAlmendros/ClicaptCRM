export function Card({ children, hoverable = false, clickable = false, className = "", onClick, ...props }) {
  const classes = [
    "card",
    hoverable && "card--hoverable",
    clickable && "card--clickable",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = "" }) {
  return <div className={`card__header ${className}`}>{children}</div>;
};

Card.Title = function CardTitle({ children, className = "" }) {
  return <h3 className={`card__title ${className}`}>{children}</h3>;
};

Card.Body = function CardBody({ children, className = "" }) {
  return <div className={`card__body ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return <div className={`card__footer ${className}`}>{children}</div>;
};
