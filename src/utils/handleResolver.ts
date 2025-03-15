export const handleResolver = async <T>(resolverFn: () => Promise<T>) => {
  try {
    return await resolverFn();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// How It Works:

//     It accepts a function (resolverFn) that returns a Promise<T>.
//     This means the function passed into handleResolver must be an asynchronous function.
//     It executes the provided function inside a try...catch block.
//     If the function executes successfully, it simply returns the resolved value.
//     If an error occurs, it logs the error and rethrows it.
//     This ensures that GraphQL receives the error properly and doesn't crash the server.

// In summary, handleResolver is a utility function that wraps an asynchronous function in a try...catch block, ensuring that GraphQL receives the error properly and doesn't crash the server.
