import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { VerificationAttributes, VerificationType } from '../../types/user.types';
import crypto from 'crypto';

// Interface for Verification creation attributes
interface VerificationCreationAttributes extends Optional<VerificationAttributes, 'id' | 'expiresAt' | 'createdAt' | 'updatedAt'> {}

// Verification model for email verification, password reset, etc.
export class Verification extends Model<VerificationAttributes, VerificationCreationAttributes> implements VerificationAttributes {
  public id!: number;
  public userId!: number;
  public token!: string;
  public type!: VerificationType;
  public expiresAt!: Date;
  public isUsed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Verification model with Sequelize
export const initVerificationModel = (sequelize: Sequelize): typeof Verification => {
  Verification.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(VerificationType)),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        // Default expiration is 24 hours from now
        const now = new Date();
        return new Date(now.setHours(now.getHours() + 24));
      },
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Verification',
    tableName: 'verifications',
    timestamps: true,
    hooks: {
      beforeCreate: (verification: Verification) => {
        // Generate a random token if not provided
        if (!verification.token) {
          verification.token = crypto.randomBytes(32).toString('hex');
        }
      },
    },
  });

  return Verification;
};

// Set up association with User model
export const associateVerificationModel = (User: any, Verification: any): void => {
  User.hasMany(Verification, { foreignKey: 'userId' });
  Verification.belongsTo(User, { foreignKey: 'userId' });
};