import { Transaction } from 'sequelize';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { RoleAttributes, RoleCreationAttributes } from '../../types/user.types';

export class RoleRepository {
  /**
   * Create a new role
   */
  async createRole(roleData: RoleCreationAttributes, transaction?: Transaction): Promise<Role> {
    return Role.create(roleData, { transaction });
  }

  /**
   * Find role by id
   */
  async findById(id: number): Promise<Role | null> {
    return Role.findByPk(id);
  }

  /**
   * Find role by name
   */
  async findByName(name: string): Promise<Role | null> {
    return Role.findOne({ where: { name } });
  }

  /**
   * Find role by id with permissions
   */
  async findByIdWithPermissions(id: number): Promise<Role | null> {
    return Role.findByPk(id, {
      include: [{ model: Permission, through: { attributes: [] } }],
    });
  }

  /**
   * Update role
   */
  async updateRole(id: number, roleData: Partial<RoleAttributes>, transaction?: Transaction): Promise<[number, Role[]]> {
    return Role.update(roleData, {
      where: { id },
      returning: true,
      transaction,
    });
  }

  /**
   * Delete role
   */
  async deleteRole(id: number, transaction?: Transaction): Promise<number> {
    return Role.destroy({
      where: { id },
      transaction,
    });
  }

  /**
   * Find all roles
   */
  async findAll(): Promise<Role[]> {
    return Role.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Add permission to role
   */
  async addPermission(roleId: number, permissionId: number, transaction?: Transaction): Promise<void> {
    const role = await Role.findByPk(roleId, { transaction });
    if (!role) throw new Error('Role not found');

    const permission = await Permission.findByPk(permissionId, { transaction });
    if (!permission) throw new Error('Permission not found');

    // @ts-ignore - TypeScript doesn't recognize the association methods
    await role.addPermission(permission, { transaction });
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: number, permissionId: number, transaction?: Transaction): Promise<void> {
    const role = await Role.findByPk(roleId, { transaction });
    if (!role) throw new Error('Role not found');

    // @ts-ignore - TypeScript doesn't recognize the association methods
    await role.removePermission(permissionId, { transaction });
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await Role.findByPk(roleId, {
      include: [{ model: Permission }],
    });
    
    if (!role) throw new Error('Role not found');
    
    // @ts-ignore - TypeScript doesn't recognize the association
    return role.Permissions || [];
  }

  /**
   * Set role permissions - replaces all existing permissions
   */
  async setPermissions(roleId: number, permissionIds: number[], transaction?: Transaction): Promise<void> {
    const role = await Role.findByPk(roleId, { transaction });
    if (!role) throw new Error('Role not found');

    // @ts-ignore - TypeScript doesn't recognize the association methods
    await role.setPermissions(permissionIds, { transaction });
  }
}

export default new RoleRepository();