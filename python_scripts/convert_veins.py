from convert_yaml_common import convert_items
import yaml

yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'ID'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'MiningItem'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'ModelIndex'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'ModelCount'], str)
yaml.BaseLoader.add_path_resolver(u'!!float', ['MonoBehaviour', 'dataArray', None, 'CircleRadius'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'MiningAudio'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'MiningEffect'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'MinerBaseModelIndex'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'MinerCircleModelIndex'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'MiningTime'], str)

convert_items(r'../disassembly/prototypes/VeinProtoSet.asset', r'../src/assets/prototypes/veins.json')
