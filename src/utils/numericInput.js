/**
 * Standard mouse wheel handler for numeric / price / quantity inputs.
 * Allows smooth increment / decrement on mouse scroll without restricting manual keyboard typing.
 */
export const handleNumericWheel = (e, currentValue, setter, step = 50, min = 0, max = Infinity) => {
  e.preventDefault();
  const val = Number(currentValue) || 0;
  if (e.deltaY < 0) {
    const nextVal = Math.min(max, val + step);
    setter(nextVal);
  } else if (e.deltaY > 0) {
    const nextVal = Math.max(min, val - step);
    setter(nextVal);
  }
};

export default handleNumericWheel;
