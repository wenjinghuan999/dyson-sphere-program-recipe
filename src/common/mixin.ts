import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Mixins extends Vue {
  popperProps = {
    arrowPosition: 'start',
    arrowOffsetScaling: 1,
    popperOptions: {
      placement: 'bottom-start',
      modifiers: {
        preventOverflow: {
          boundariesElement:
          typeof document !== 'undefined' ? document.body : ''
        }
      }
    }
  };

  unitOptions = [
    's',
    'min'
  ]

  localeOptions = [
    'ZHCN',
    'ENUS',
    'FRFR'
  ]

  graphViewModeOptions = [
    'Compact',
    'Sparse'
  ]
}
