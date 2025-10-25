
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // The result is a data URL: "data:image/jpeg;base64,..."
      // We need to extract just the Base64 part after the comma.
      const resultString = reader.result as string;
      const base64String = resultString.split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error("Failed to parse Base64 string from file."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
