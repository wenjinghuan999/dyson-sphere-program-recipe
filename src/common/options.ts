class Options {
  unit: string;
  graphViewMode: string;

  constructor (unit = 's', graphViewMode = 'Sparse') {
    this.unit = unit
    this.graphViewMode = graphViewMode
  }

  static Serialize (options: Options): string {
    return JSON.stringify(options)
  }

  static Deserialize (text: string): Options {
    const data = JSON.parse(text)
    return new Options(data.unit, data.graphViewMode)
  }
}

export {
  Options
}
