export const nodeOps = {
  // 增删改查 元素中插入文本 文本的创建 文本元素的内容设置 获取父元素 获取下一个元素
  createElement: (tagName: string) => document.createElement(tagName),
  remove: (child: HTMLElement) => child.parentNode?.removeChild(child),
  insert: (
    child: HTMLElement,
    parent: HTMLElement,
    // 要插入的元素的位置，如果位置为null，表示追加元素 append
    anchor: null | HTMLElement = null
  ) => parent.insertBefore(child, anchor),
  querySelector: (selector: string) => document.querySelector(selector),
  setElementText: (element: HTMLElement, text: string) =>
    (element.textContent = text),
  createTextNode: (text: string) => document.createTextNode(text),
  setTextContent: (node: Text, text: string) => (node.nodeValue = text),
  getParent: (node: Node) => node.parentNode,
  getNextSibling: (node: Node) => node.nextSibling,
};
