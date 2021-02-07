import os
import cv2
import numpy as np

EXTS = ['.png']
SIZE = (64, 64)

def copy_icons(src: str, dst: str):
  os.makedirs(dst, exist_ok=True)
  files = [f for f in os.listdir(src) if os.path.splitext(f)[1] in EXTS]
  for f in files:
    im = cv2.imread(os.path.join(src, f), cv2.IMREAD_UNCHANGED)
    im = cv2.resize(im, SIZE, interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(dst, f), im)
    im = cv2.imread(os.path.join(src, f), cv2.IMREAD_UNCHANGED)


copy_icons(r'../disassembly/icons/itemrecipe', r'../src/assets/Icons/ItemRecipe')
copy_icons(r'../disassembly/icons/vein', r'../src/assets/Icons/Vein')
copy_icons(r'../disassembly/icons/tech', r'../src/assets/Icons/Tech')


def create_placeholder(dst: str):
  placeholder = np.concatenate([255 * np.ones(SIZE + (3,), np.uint8), np.zeros(SIZE + (1,), np.uint8)], axis=2)
  cv2.imwrite(os.path.join(dst, 'placeholder.png'), placeholder)

create_placeholder(r'../src/assets/Icons')
