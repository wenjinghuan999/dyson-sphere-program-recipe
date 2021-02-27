import os
import cv2
import numpy as np
from typing import Tuple

EXT = '.png'
SIZE = (64, 64, 3)
BG_COLOR = (82, 83, 81)
FG_PIXELS = 2
LOOP_PIXELS = 8

def generate_belt_icon(path: str, color: Tuple[int]):
  os.makedirs(os.path.split(path)[0], exist_ok=True)
  im = BG_COLOR * np.ones(SIZE, dtype=np.uint8)
  for i in range(SIZE[0]):
    for j in range(SIZE[1]):
      if (j - i) % LOOP_PIXELS < FG_PIXELS:
        im[i, j % SIZE[1], :] = color

  cv2.imwrite(path, im)

generate_belt_icon(r'../src/assets/Icons/Belt/belt-1.png', (111, 169, 218))
generate_belt_icon(r'../src/assets/Icons/Belt/belt-2.png', (157, 175, 89))
generate_belt_icon(r'../src/assets/Icons/Belt/belt-3.png', (216, 171, 102))
