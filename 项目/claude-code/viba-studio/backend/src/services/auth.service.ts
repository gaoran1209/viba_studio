import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { JWTService } from './jwt.service';
import { RegisterBody, LoginBody, AuthResponse } from '../types';
import { Op } from 'sequelize';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async register(data: RegisterBody): Promise<AuthResponse> {
    const { email, password, full_name } = data;

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email: { [Op.iLike]: email } } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 哈希密码
    const hashed_password = await this.hashPassword(password);

    // 创建用户
    const user = await User.create({
      email,
      hashed_password,
      full_name,
    });

    // 生成 tokens
    const payload = { id: user.id, email: user.email };
    const access_token = JWTService.generateAccessToken(payload);
    const refresh_token = JWTService.generateRefreshToken(payload);

    return {
      access_token,
      refresh_token,
      token_type: 'bearer',
      user: user.toSafeJSON(),
    };
  }

  static async login(data: LoginBody): Promise<AuthResponse> {
    const { email, password } = data;

    // 查找用户
    const user = await User.findOne({
      where: { email: { [Op.iLike]: email } },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 验证密码
    const isPasswordValid = await this.comparePassword(password, user.hashed_password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 生成 tokens
    const payload = { id: user.id, email: user.email };
    const access_token = JWTService.generateAccessToken(payload);
    const refresh_token = JWTService.generateRefreshToken(payload);

    return {
      access_token,
      refresh_token,
      token_type: 'bearer',
      user: user.toSafeJSON(),
    };
  }

  static async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // 验证用户是否仍然存在
      const user = await User.findByPk(payload.id);
      if (!user) {
        throw new Error('User not found');
      }

      const access_token = JWTService.generateAccessToken({
        id: user.id,
        email: user.email,
      });

      return { access_token };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
