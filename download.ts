import fs from "fs";
import https from "https";

const url = "https://storage.googleapis.com/static.ai.studio/attachments/a380962b-6569-42b7-a36f-e3acb40fc3c1/input_file_4.png";

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed: ${res.statusCode}`);
    return;
  }
  const file = fs.createWriteStream("test.png");
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download complete");
  });
});
