function setRootMenuNode(el: HTMLElement) {
  const rootMenuNode = el;
  rootMenuNode.setAttribute('data-root-menu', 'true');
  console.log('Root menu node set:', rootMenuNode);
}

export default setRootMenuNode;
