import { Sequelize, DataTypes, Model, Optional, ModelCtor } from 'sequelize';
import { GemstoneModel } from './gemstone.model';

// Interface for Jewelry attributes
interface JewelryAttributes {
  id: number;
  type: string;
  material: string;
  price: number;
  weight: number;
  description: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for Jewelry creation attributes (optional 'id')
interface JewelryCreationAttributes extends Optional<JewelryAttributes, 'id'> {}

// Define the Jewelry model interface, extending Sequelize's Model
export interface JewelryModel extends Model<JewelryAttributes, JewelryCreationAttributes>, JewelryAttributes {
  // Add the Gemstones property to match the belongsToMany association
  Gemstones?: GemstoneModel[];
}

// Function to initialize the Jewelry model
export const initJewelryModel = (sequelize: Sequelize): ModelCtor<JewelryModel> => {
  const Jewelry = sequelize.define<JewelryModel>('Jewelry', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    material: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'jewelry',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Jewelry;
};

// Function to initialize the JewelryGemstones join table model
export const initJewelryGemstonesModel = (
  sequelize: Sequelize, 
  Jewelry: ModelCtor<JewelryModel>, 
  Gemstone: ModelCtor<GemstoneModel>
) => {
  const JewelryGemstones = sequelize.define('JewelryGemstones', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    jewelry_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Jewelry,
        key: 'id'
      }
    },
    gemstone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Gemstone,
        key: 'id'
      }
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Position/location of the gemstone in the jewelry piece'
    }
  }, {
    tableName: 'jewelry_gemstones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Set up the many-to-many association
  Jewelry.belongsToMany(Gemstone, { 
    through: JewelryGemstones,
    foreignKey: 'jewelry_id',
    as: 'Gemstones'
  });
  
  Gemstone.belongsToMany(Jewelry, { 
    through: JewelryGemstones,
    foreignKey: 'gemstone_id',
    as: 'Jewelry'
  });

  return JewelryGemstones;
};