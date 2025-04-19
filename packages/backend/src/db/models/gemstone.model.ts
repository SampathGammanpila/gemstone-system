import { Sequelize, DataTypes, Model, Optional, ModelCtor } from 'sequelize';

// Interface for Gemstone attributes
interface GemstoneAttributes {
  id: number;
  type: string;
  carat: number;
  created_at?: Date; // Make optional as it has a default value
  updated_at?: Date; // Make optional for consistency
  // Add other attributes as needed
}

// Interface for Gemstone creation attributes (optional 'id')
interface GemstoneCreationAttributes extends Optional<GemstoneAttributes, 'id'> {}

// Define the Gemstone model interface, extending Sequelize's Model
export interface GemstoneModel extends Model<GemstoneAttributes, GemstoneCreationAttributes>, GemstoneAttributes {}

// Function to initialize the Gemstone model
export const initGemstoneModel = (sequelize: Sequelize): ModelCtor<GemstoneModel> => {
  const Gemstone = sequelize.define<GemstoneModel>('Gemstone', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    carat: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false // Ensure it's not null
    },
    updated_at: { // Add updated_at for consistency with timestamps: true
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false // Ensure it's not null
    }
  }, {
    tableName: 'gemstones',
    timestamps: true, // Sequelize handles createdAt and updatedAt
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Gemstone;
};
