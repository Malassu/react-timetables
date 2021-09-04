export default function getTimestamp() {  
  const today = new Date();
  const mins = today.getMinutes();
  let digit = "";

  if(mins < 10) {
    digit = "0"
  }

  return today.getHours() + ":" + digit + mins;
}
