import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: string;
  email: string;
  hashed_password: string;
  full_name?: string;
  created_at: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public hashed_password!: string;
  public full_name?: string;
  public readonly created_at!: Date;
  public readonly updated_at?: Date;

  public toSafeJSON(): Omit<UserAttributes, 'hashed_password'> {
    return {
      id: this.id,
      email: this.email,
      full_name: this.full_name,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  static initModel(sequelize: Sequelize) {
    return User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        hashed_password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        full_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          {
            unique: true,
            fields: ['email'],
          },
        ],
      }
    );
  }
}
