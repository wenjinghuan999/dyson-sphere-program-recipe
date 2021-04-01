from convert_yaml_common import convert_items
import yaml
import os
import json

yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'node'], str)
yaml.BaseLoader.add_path_resolver(u'!!float', ['MonoBehaviour', 'connectDistance'], str)
yaml.BaseLoader.add_path_resolver(u'!!float', ['MonoBehaviour', 'coverRadius'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'generator'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'photovoltaic'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'wind'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'gamma'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'genEnergyPerTick'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'useFuelPerTick'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'fuelMask'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'catalystId'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'productId'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'productHeat'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'accumulator'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'inputEnergyPerTick'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'outputEnergyPerTick'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'maxAcuEnergy'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'exchanger'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'exchangeEnergyPerTick'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'emptyId'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'fullId'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'consumer'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'charger'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'workEnergyPerTick'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'idleEnergyPerTick'], str)

ENTITIES_DIR = r'../disassembly/entities/prefabs/'
TARGET_FILE = r'../src/assets/prototypes/entities.json'

prefabs = [f for f in os.listdir(ENTITIES_DIR) if os.path.splitext(f)[1] == '.prefab']
result = {}
for prefab in prefabs:
  item_name = os.path.splitext(prefab)[0]
  filename = os.path.join(ENTITIES_DIR, prefab)
  entity_json = convert_items(filename)
  for doc in entity_json:
    if 'MonoBehaviour' in doc:
      if 'workEnergyPerTick' in doc['MonoBehaviour']:
        entity = doc['MonoBehaviour']
        entity = { k : v for (k, v) in entity.items() if not k.startswith('m_') }
        print(entity)
        result.update({ item_name : entity })

if os.path.split(TARGET_FILE)[0]:
  os.makedirs(os.path.split(TARGET_FILE)[0], exist_ok=True)
with open(TARGET_FILE, 'w', encoding="utf-8") as f:
  json.dump(result, f, indent=2)
