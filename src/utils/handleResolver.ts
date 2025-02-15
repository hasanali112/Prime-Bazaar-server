export const handleResolver = async <T>(resolverFn: () => Promise<T>) => {
  try {
    return await resolverFn();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
