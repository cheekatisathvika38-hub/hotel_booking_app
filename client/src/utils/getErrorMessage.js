// Turns any Axios error into a message we can show to the user
const getErrorMessage = (error) => {
  if (error.response) {
    // The server answered with an error; our API always sends { message }
    return error.response.data?.message || "Something went wrong. Please try again.";
  }
  if (error.request) {
    // The request was sent but nothing came back
    return "Cannot reach the server. Please check your connection.";
  }
  return "Something went wrong. Please try again.";
};

export default getErrorMessage;