// TRACED:FD-AUTH-002
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS } from 'shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, companyId: string) {
    // findFirst justified: checking for existing user by email before registration
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role as 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN',
        companyId,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, companyId: user.companyId };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto) {
    // findFirst justified: email lookup for authentication — unique constraint ensures single result
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, companyId: user.companyId };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async refresh(userId: string) {
    // findFirst justified: looking up user by ID for token refresh — ID is unique
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, companyId: user.companyId };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
