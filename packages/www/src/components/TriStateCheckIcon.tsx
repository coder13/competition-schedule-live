interface TriStateCheckIconProps {
  checked: true | false | 'some';
}

function TriStateCheckIcon({ checked }: TriStateCheckIconProps) {
  if (checked === 'some') {
    return <i className="fa-regular fa-square-minus" />;
  }

  return checked ? (
    <i className="fa-regular fa-square-check" />
  ) : (
    <i className="fa-regular fa-square" />
  );
}

export default TriStateCheckIcon;
