import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { PermissionAttributes } from '../../types/user.types';

// Interface for Permission creation attributes
interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Permission model
export class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: number;
  public name!: string;
  public resource!: string;
  public action!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Permission model with Sequelize
export const initPermissionModel = (sequelize: Sequelize): typeof Permission => {
  Permission.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'The resource this permission applies to (e.g., gemstone, user)',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'The action allowed on the resource (e.g., create, read, update, delete)',
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
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true,
  });

  return Permission;
};

// Role permissions junction table to handle many-to-many relation
export const initRolePermissionsModel = (sequelize: Sequelize, Role: any, Permission: any): void => {
  const RolePermissions = sequelize.define('RolePermissions', {
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id',
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Permission,
        key: 'id',
      },
    },
  }, {
    tableName: 'role_permissions',
    timestamps: false,
  });

  // Setup associations
  Role.belongsToMany(Permission, { through: RolePermissions, foreignKey: 'roleId', otherKey: 'permissionId' });
  Permission.belongsToMany(Role, { through: RolePermissions, foreignKey: 'permissionId', otherKey: 'roleId' });
};