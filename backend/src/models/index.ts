import { Sequelize, Options } from 'sequelize';
import { config } from '../config';
import { User } from './User';
import { Generation } from './Generation';

const sequelizeOptions: Options = {
  dialect: 'postgres',
  logging: config.nodeEnv === 'development' ? console.log : false,
  dialectOptions: {
    // Force IPv4
    family: 4,
  },
  define: {
    underscored: true,
  },
};

if (config.nodeEnv === 'production') {
  sequelizeOptions.dialectOptions = {
    ...sequelizeOptions.dialectOptions,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

export const sequelize = new Sequelize(config.database.url, sequelizeOptions);

export { User, Generation };

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    // 初始化所有模型
    User.initModel(sequelize);
    Generation.initModel(sequelize);

    // 设置关联关系
    Generation.setupAssociations();

    // 同步模型到数据库
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synchronized.');
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
    throw error;
  }
};
