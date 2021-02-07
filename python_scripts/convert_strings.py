from convert_yaml_common import convert_items
import yaml

yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'ID'], str)

convert_items(r'../disassembly/prototypes/StringProtoSet.asset', r'../src/assets/prototypes/strings.json')
