import fs from "fs";
import path from "path";
import IInput from "./IInput";
import evaluate from "./evaluate";
import ITemplate from "./ITemplate";
import IBlock from "./IBlock";

function renderView(block: IBlock, input?: IInput): string {
  let viewPath = path.join(block.currentWorkingDirectory, block.header);
  if (path.extname(block.header) === "") {
    viewPath = `${viewPath}.${block.defaultFileExtension}`;
  }

  try {
    fs.accessSync(viewPath, fs.constants.R_OK);

    const viewTemplate: ITemplate = {
      currentWorkingDirectory: block.currentWorkingDirectory,
      defaultFileExtension: block.defaultFileExtension,
      template: fs.readFileSync(viewPath).toString(),
    };
    const renderedView = render(viewTemplate, input);

    const template: ITemplate = {
      currentWorkingDirectory: block.currentWorkingDirectory,
      defaultFileExtension: block.defaultFileExtension,
      template: block.body,
    };
    const renderedViewBody = render(template, input);

    return `${renderedView}\n\n\n\n\n\n\n${renderedViewBody}`;
  } catch {
    return "";
  }
}

function renderBlock(block: IBlock, input?: IInput): string {
  let body = "";
  if (block.body) {
    const template: ITemplate = {
      currentWorkingDirectory: block.currentWorkingDirectory,
      defaultFileExtension: block.defaultFileExtension,
      template: block.body,
    };

    body = render(template, input);
  }

  return `[[[${block.header}|||${body}]]]`;
}

function renderSwitch(block: IBlock, input?: IInput): string {
  const caseBlockRegx = new RegExp("<case\\s+{(.*?)}>(.+?)<\\/case>", "gsi");
  const switchValue = evaluate(block.header, input);

  return block.body.replace(
    caseBlockRegx,
    (match: string, caseHeader: string, caseBody: string): string => {
      const template: ITemplate = {
        currentWorkingDirectory: block.currentWorkingDirectory,
        defaultFileExtension: block.defaultFileExtension,
        template: caseBody,
      };

      if (!caseHeader) return render(template, input);
      const caseValue = evaluate(caseHeader, input);

      if (switchValue === caseValue) {
        return render(template, input);
      }

      return "";
    }
  );
}

function renderFor(block: IBlock, input?: IInput): string {
  const forBlockRegx = new RegExp("(\\w+)\\s+of\\s+(.+)", "gi");

  const [match, key, value] = forBlockRegx.exec(block.header);
  const values = evaluate(value, input);

  const ret = [];
  if (values && Array.isArray(values) && values.length > 0) {
    for (let xx = 0; xx < values.length; xx++) {
      const template: ITemplate = {
        currentWorkingDirectory: block.currentWorkingDirectory,
        defaultFileExtension: block.defaultFileExtension,
        template: block.body,
      };

      ret.push(render(template, { [key]: values[xx] }));
    }
  }

  return ret.join("");
}

function renderCode(block: IBlock, input?: IInput): string {
  const value = evaluate(block.body, input);

  if (Array.isArray(value)) {
    return value.join("");
  } else {
    return value;
  }
}

function render(template: ITemplate | string, input?: IInput): string {
  const viewRegx = new RegExp("<view\\s+{(.+?)}>(.+)<\\/view>", "gsi");
  const slBlockRegx = new RegExp("<block\\s+{(.+?)}\\s+\\/>", "gsi");
  const mlBlockRegx = new RegExp("<block\\s+{(.+?)}>(.+?)<\\/block>", "gsi");
  const forRegx = new RegExp("<for\\s+{(.+?)}>(.+)<\\/for>", "gsi");
  const switchBlockRegx = new RegExp(
    "/<switch\\s+{(.+?)}>(.+)<\\/switch>",
    "gsi"
  );
  const codeBlockRegx = new RegExp("{(.+?)}", "g");

  try {
    const chtml: ITemplate = {
      currentWorkingDirectory: path.resolve("./"),
      defaultFileExtension: "chtml",
      template: "",
    };

    if (typeof template === "string") {
      chtml.template = template;
    } else {
      chtml.currentWorkingDirectory = path.resolve(
        template.currentWorkingDirectory
      );
      chtml.defaultFileExtension =
        template.defaultFileExtension ?? chtml.defaultFileExtension;
      chtml.template = template.template;
    }

    return chtml.template
      .replace(
        viewRegx,
        (match: string, header: string, body: string): string => {
          return renderView({ ...chtml, template: match, header, body }, input);
        }
      )
      .replace(slBlockRegx, (match: string, header: string): string => {
        return renderBlock(
          { ...chtml, template: match, header, body: "" },
          input
        );
      })
      .replace(
        mlBlockRegx,
        (match: string, header: string, body: string): string => {
          return renderBlock(
            { ...chtml, template: match, header, body },
            input
          );
        }
      )
      .replace(
        switchBlockRegx,
        (match: string, header: string, body: string): string => {
          return renderSwitch(
            { ...chtml, template: match, header, body },
            input
          );
        }
      )
      .replace(
        forRegx,
        (match: string, header: string, body: string): string => {
          return renderFor({ ...chtml, template: match, header, body }, input);
        }
      )
      .replace(codeBlockRegx, (match: string, body: string): string => {
        return renderCode(
          { ...chtml, template: match, header: "", body },
          input
        );
      });
  } catch (err) {
    return `<pre>${err.message}</pre>`;
  }
}

export default render;
