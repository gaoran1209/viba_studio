import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';

export enum GenerationType {
  DERIVATION = 'derivation',
  AVATAR = 'avatar',
  TRY_ON = 'try_on',
  SWAP = 'swap',
}

export enum GenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ImageData {
  filename: string;
  storage_url: string;
}

export interface GenerationAttributes {
  id: string;
  user_id: string;
  type: GenerationType;
  status: GenerationStatus;
  input_images: ImageData[];
  output_images: ImageData[];
  parameters: Record<string, any>;
  error_message?: string;
  created_at: Date;
  completed_at?: Date;
}

interface GenerationCreationAttributes extends Optional<GenerationAttributes, 'id' | 'created_at' | 'completed_at'> {}

export class Generation extends Model<GenerationAttributes, GenerationCreationAttributes> implements GenerationAttributes {
  public id!: string;
  public user_id!: string;
  public type!: GenerationType;
  public status!: GenerationStatus;
  public input_images!: ImageData[];
  public output_images!: ImageData[];
  public parameters!: Record<string, any>;
  public error_message?: string;
  public readonly created_at!: Date;
  public readonly completed_at?: Date;

  static initModel(sequelize: Sequelize) {
    return Generation.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        type: {
          type: DataTypes.ENUM(...Object.values(GenerationType)),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(GenerationStatus)),
          allowNull: false,
          defaultValue: GenerationStatus.PENDING,
        },
        input_images: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        output_images: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        parameters: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        error_message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        completed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'generation_history',
        timestamps: false,
        indexes: [
          {
            fields: ['user_id'],
          },
          {
            fields: ['type'],
          },
          {
            fields: ['status'],
          },
          {
            fields: ['created_at'],
          },
        ],
      }
    );
  }

  static setupAssociations() {
    User.hasMany(Generation, {
      foreignKey: 'user_id',
      as: 'generations',
      onDelete: 'CASCADE',
    });

    Generation.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }
}
