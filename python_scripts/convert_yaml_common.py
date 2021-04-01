import yaml
import json
import os
import re
from typing import List

def int_constructor(loader, node):
  return int(loader.construct_scalar(node))
  
def bool_constructor(loader, node):
  return bool(loader.construct_scalar(node) != "0")
  
def float_constructor(loader, node):
  return float(loader.construct_scalar(node))
  
def unity_constructor(loader, node):
  return loader.construct_mapping(node)

def intlist_constructor(loader, node):
  s = loader.construct_scalar(node)
  ret: List[int] = []
  for i in range(len(s) // 8):
    item = s[i * 8: (i + 1) * 8]
    ret.append(
      (int(item[0:2], 16)) | 
      (int(item[2:4], 16) << 8) | 
      (int(item[4:6], 16) << 16) | 
      (int(item[6:8], 16) << 32)
    )
  return ret
  
def intstrlist_constructor(loader, node):
  return [str(i) for i in intlist_constructor(loader, node)]

def convert_items(proto: str, out_config: str = ''):
  with open(proto, 'r', encoding="utf-8") as f:
    file_data = f.read()

  # yaml.BaseLoader.add_constructor(u'tag:unity3d.com,2011:114', unity_constructor)
  yaml.BaseLoader.add_constructor(u'!intlist', intlist_constructor)
  yaml.BaseLoader.add_constructor(u'!intstrlist', intstrlist_constructor)
  yaml.BaseLoader.add_constructor(u'!!int', int_constructor)
  yaml.BaseLoader.add_constructor(u'!!bool', bool_constructor)
  yaml.BaseLoader.add_constructor(u'!!float', float_constructor)
  yaml.BaseLoader.DEFAULT_TAGS.update({u'!u!': u'tag:unity3d.com,2011:'})
  
  data = [d for d in yaml.load_all(file_data, Loader=yaml.BaseLoader)]
  
  if out_config:
    print(data)
    if os.path.split(out_config)[0]:
      os.makedirs(os.path.split(out_config)[0], exist_ok=True)
    with open(out_config, 'w', encoding="utf-8") as f:
      json.dump(data[0]['MonoBehaviour']['dataArray'], f, indent=2)
    return []
  else:
    return data
