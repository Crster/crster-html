import fs from "fs";
import render from "./render";

function expressView(
  filePath: string,
  options: any,
  callback: { (error: object | null, rendered?: string): object }
) {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    const rendered = render(content.toString(), options);
    return callback(null, rendered);
  });
}

export default expressView;
