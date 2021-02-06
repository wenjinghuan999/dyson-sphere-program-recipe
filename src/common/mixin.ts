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

  allProducts = [
    { id: 0, name: 'Iron Ingot', icon: 'Iron_Ingot.png' },
    { id: 1, name: 'Copper Ingot', icon: 'Copper_Ingot.png' },
    { id: 2, name: 'High Purity Silicon', icon: 'High-Purity_Silicon.png' },
    { id: 3, name: 'Titanium Ingot', icon: 'Titanium_Ingot.png' },
    { id: 4, name: 'Stone Brick', icon: 'Stone.png' },
    { id: 5, name: 'Energetic Graphite', icon: 'Energetic_Graphite.png' },
    { id: 6, name: 'Plasma Refining', icon: 'Plasma_Refining.png' },
    { id: 7, name: 'Plastic', icon: 'Plastic.png' },
    { id: 8, name: 'Graphene', icon: 'Graphene.png' },
    { id: 9, name: 'Refined Oil', icon: 'Refined_Oil.png' },
    { id: 10, name: 'Hydrogen', icon: 'Hydrogen.png' },
    { id: 11, name: '', icon: 'Placeholder.png' },

    { id: 12, name: 'Magnet', icon: 'Magnet.png' },
    { id: 13, name: 'Magnetic Coil', icon: 'Magnetic_Coil.png' },
    { id: 14, name: 'Crystal Silicon', icon: 'Crystal_Silicon.png' },
    { id: 15, name: 'Titanium Alloy', icon: 'Titanium_Alloy.png' },
    { id: 16, name: 'Glass', icon: 'Glass.png' },
    { id: 17, name: 'Diamond', icon: 'Diamond.png' },
    { id: 18, name: 'X-Ray Cracking', icon: 'X-Ray_Cracking.png' },
    { id: 19, name: 'Organic Crystal', icon: 'Organic_Crystal.png' },
    { id: 20, name: 'Graphene (Advanced)', icon: 'Graphene_2.png' },
    { id: 21, name: 'Hydrogen Fuel Rod', icon: 'Hydrogen_Fuel_Rod.png' },
    { id: 22, name: 'Deuteron Fuel Rod', icon: 'Deuteron_Fuel_Rod.png' },
    { id: 23, name: 'Antimatter Fuel Rod', icon: 'Antimatter_Fuel_Rod.png' },

    { id: 24, name: 'Steel', icon: 'Steel.png' },
    { id: 25, name: 'Electric Motor', icon: 'Electric_Motor.png' },
    { id: 26, name: 'Crystal Silicon (Advanced)', icon: 'Crystal_Silicon(Advanced).png' },
    { id: 27, name: 'Titanium Glass', icon: 'Titanium_Glass.png' },
    { id: 28, name: 'Prism', icon: 'Prism.png' },
    { id: 29, name: 'Diamond (Advanced)', icon: 'Diamond_2.png' },
    { id: 30, name: 'Deuterium Fractionation', icon: 'Deuterium_Fractionation.png' },
    { id: 31, name: 'Crystal Rubber (Advanced)', icon: 'Crystal_Rubber_2.png' },
    { id: 32, name: 'Titanium Crystal', icon: 'Titanium_Crystal.png' },
    { id: 33, name: 'Thruster', icon: 'Thruster.png' },
    { id: 34, name: 'Ion Thruster', icon: 'Ion_Thruster.png' },
    { id: 35, name: 'Strange Matter', icon: 'Strange_Matter.png' },

    { id: 36, name: 'Gear', icon: 'Gear.png' },
    { id: 37, name: 'Electromagnetic Turbine', icon: 'Electromagnetic_Turbine.png' },
    { id: 38, name: 'Silicium Ore', icon: 'Silicium_Ore.png' },
    { id: 39, name: 'Circuit Board', icon: 'Circuit_Board.png' },
    { id: 40, name: 'Gravity Lens', icon: 'Gravity_Lens.png' },
    { id: 41, name: 'Sulphuric Acid', icon: 'Sulphuric_Acid.png' },
    { id: 42, name: 'Deuterium', icon: 'Deuterium.png' },
    { id: 43, name: 'Plane Filter', icon: 'Plane_Filter.png' },
    { id: 44, name: 'Carbon Nanotube', icon: 'Carbon_Nanotube.png' },
    { id: 45, name: 'Logistics Drone', icon: 'Logistics_Drone.png' },
    { id: 46, name: 'Logistics Vessel', icon: 'Logistics_Vessel.png' },
    { id: 47, name: 'Small Carrier Rocket', icon: 'Small_Carrier_Rocket.png' },

    { id: 48, name: 'Plasma Exciter', icon: 'Plasma_Exciter.png' },
    { id: 49, name: 'Super-Magnetic Ring', icon: 'Super-Magnetic_Ring.png' },
    { id: 50, name: 'Particle Broadband', icon: 'Particle_Broadband.png' },
    { id: 51, name: 'Processor', icon: 'Processor.png' },
    { id: 52, name: 'Casimir Crystal', icon: 'Casimir_Crystal.png' },
    { id: 53, name: 'Partical Capacitor', icon: 'Partical_Capacitor.png' },
    { id: 54, name: 'Space Warper', icon: 'Space_Warper.png' },
    { id: 55, name: 'Annihilation Constraint Sphere', icon: 'Annihilation_Constraint_Sphere.png' },
    { id: 56, name: 'Carbon Nanotube (Advanced)', icon: 'Carbon_Nanotube_(Advanced).png' },
    { id: 57, name: 'Solar Sail', icon: 'Solar_Sail.png' },
    { id: 58, name: 'Frame Material', icon: 'Frame_Material.png' },
    { id: 59, name: 'Dyson Sphere Component', icon: 'Dyson_Sphere_Component.png' },

    { id: 60, name: 'Photo Shifter', icon: 'Photo_Shifter.png' },
    { id: 61, name: 'Photo Shifter (Advanced)', icon: 'Photo_Shifter_2.png' },
    { id: 62, name: 'Microcrystalline Component', icon: 'Microcrystalline_Component.png' },
    { id: 63, name: 'Quantum Chip', icon: 'Quantum_Chip.png' },
    { id: 64, name: 'Casimir Crystal (Advanced)', icon: 'Casimir_Crystal_2.png' },
    { id: 65, name: 'Partical Capacitor (Advanced)', icon: 'Partical_Capacitor_2.png' },
    { id: 66, name: 'Space Warper (Advanced)', icon: 'Space_Warper_2.png' },
    { id: 67, name: 'Mass-Energy Storage', icon: 'Mass-Energy_Storage.png' },
    { id: 68, name: 'Anti Matter', icon: 'Anti_Matter.png' },
    { id: 69, name: '', icon: 'Placeholder.png' },
    { id: 70, name: '', icon: 'Placeholder.png' },
    { id: 71, name: '', icon: 'Placeholder.png' },

    { id: 72, name: 'Electromagnetic Matrix', icon: 'Electromagnetic_Matrix.png' },
    { id: 73, name: 'Energy Matrix', icon: 'Energy_Matrix.png' },
    { id: 74, name: 'Structure Matrix', icon: 'Structure_Matrix.png' },
    { id: 75, name: 'Information Matrix', icon: 'Information_Matrix.png' },
    { id: 76, name: 'Gravity Matrix', icon: 'Gravity_Matrix.png' },
    { id: 77, name: 'Universe Matrix', icon: 'Universe_Matrix.png' },
    { id: 78, name: '', icon: 'Placeholder.png' },
    { id: 79, name: '', icon: 'Placeholder.png' },
    { id: 80, name: '', icon: 'Placeholder.png' },
    { id: 81, name: '', icon: 'Placeholder.png' },
    { id: 82, name: '', icon: 'Placeholder.png' },
    { id: 83, name: 'Foundation', icon: 'Foundation.png' }
  ];

  static noneProduct = { id: -1, name: 'None', icon: 'DSPGAME.png' }
  static noneProductAndAmount = { item: Mixins.noneProduct, amount: 0 }

  unitOptions = [
    's',
    'min'
  ]
}
