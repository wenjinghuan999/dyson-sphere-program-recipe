import os
import csv
import json
from typing import List, Dict, Union

def convert_ui_string(src: str, out_config: str):
  result: List[Dict[str, Union[str, int]]] = []
  with open(src, 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter=',')
    for row in reader:
      entry = {
        'Name': row[0],
        'ID': len(result) + 1,
        'ZHCN': row[1],
        'ENUS': row[0],
        'FRFR': row[2]
      }
      result.append(entry)
  
  if os.path.split(out_config)[0]:
    os.makedirs(os.path.split(out_config)[0], exist_ok=True)
    
  with open(out_config, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2)


convert_ui_string(r'./ui-strings.csv', r'../src/assets/ui-strings.json')
