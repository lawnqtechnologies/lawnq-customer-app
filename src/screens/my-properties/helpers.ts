export const isSelected = (
  type: string,
  id: number,
  text: string,
  selectedId: number,
  selectedText: string,
) => {
  switch (type) {
    case "pet": {
      if (id === selectedId) return true;
      return false;
    }
    case "mow-type": {
      if (id === selectedId) return true;
      return false;
    }
    case "terrain-type": {
      if (text === selectedText) return true;
      return false;
    }
    default:
      return false;
  }
};
