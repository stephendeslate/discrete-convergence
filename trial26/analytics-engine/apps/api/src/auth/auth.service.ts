// TRACED: AE-EDGE-014 — Duplicate email check prevents registration conflicts
// TRACED: AE-EDGE-015 — Invalid credentials return generic error (no info leak)
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// TRACED: AE-AUTH-001 — Registration with valid data
// TRACED: AE-AUTH-002 — Registration with duplicate email
// TRACED: AE-AUTH-003 — Login with valid credentials
// TRACED: AE-AUTH-004 — Login with invalid password

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    // findFirst: Check for existing user with same email (unique constraint check)
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // findFirst: Look up existing tenant by name for multi-user tenant sharing
    let tenant = await this.prisma.tenant.findFirst({
      where: { name: dto.tenantName },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: { name: dto.tenantName },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        tenantId: tenant.id,
        role: 'ADMIN',
      },
    });

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // findFirst: Login looks up by email (unique field, but using findFirst for flexibility)
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
