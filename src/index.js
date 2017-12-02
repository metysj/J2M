import { ToMdWorker } from './tomdworker';
import { ToJiraWorker } from './tojiraworker';

const convert = function(str, worker, customHandler) {
  const pipeline = worker.pipeline();
  if (customHandler && customHandler.preProcessing) {
    str = customHandler.preProcessing(str);
  }
  pipeline.forEach(method => {
    const func = customHandler && customHandler[method] ? customHandler[method] : worker[method];
    str = func(str);
  });
  if (customHandler && customHandler.postProcessing) {
    str = customHandler.postProcessing(str);
  }
  return str;
};

export class Converter {
  toMarkdown(str, customHandler) {
    return convert(str, new ToMdWorker(), customHandler);
  }

  toJira(str, customHandler) {
    return convert(str, new ToJiraWorker(), customHandler);
  }
}
