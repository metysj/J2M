import { Jira2MdWorker } from './jira2md';
import { Md2JiraWorker } from './md2jira';

const convert = function(str, worker, customHandler) {
  const pipeline = worker.pipeline();
  if (customHandler && customHandler.preProcessing) {
    str = customHandler.preProcessing(str);
  }
  pipeline.forEach(method => {
    const func = customHandler && customHandler[method] ? customHandler[method].bind(customHandler) : worker[method].bind(worker);
    str = func(str);
  });
  if (customHandler && customHandler.postProcessing) {
    str = customHandler.postProcessing(str);
  }
  return str;
};

export class Converter {
  toMarkdown(str, customHandler) {
    return convert(str, new Jira2MdWorker(), customHandler);
  }

  toJira(str, customHandler) {
    return convert(str, new Md2JiraWorker(), customHandler);
  }
}