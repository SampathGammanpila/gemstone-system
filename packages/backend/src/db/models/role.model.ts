import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { RoleAttributes } from '../../types/user.types';

// Interface for Role creation attributes
interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Role model
export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Role model with Sequelize
export const initRoleModel = (sequelize: Sequelize): typeof Role => {
  Role.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
  });

  return Role;
};

// User roles junction table to handle many-to-many relation
export const initUserRolesModel = (sequelize: Sequelize, User: any, Role: any): void => {
  const UserRoles = sequelize.define('UserRoles', {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id',
      },
    },
  }, {
    tableName: 'user_roles',
    timestamps: false,
  });

  // Setup associations
  User.belongsToMany(Role, { through: UserRoles, foreignKey: 'userId', otherKey: 'roleId' });
  Role.belongsToMany(User, { through: UserRoles, foreignKey: 'roleId', otherKey: 'userId' });
};