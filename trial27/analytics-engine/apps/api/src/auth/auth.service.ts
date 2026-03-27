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
// TRACED: AE-AUTH-003 — Registration validation
// TRACED: AE-AUTH-004 — Login with valid credentials
// TRACED: AE-AUTH-005 — Login with invalid password
// TRACED: AE-AUTH-006 — Login with nonexistent email
// TRACED: AE-SEC-002 — Password hashing with bcryptjs

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ accessToken: string; user: { id: string; email: string; name: string } }> {
    // findFirst used here: checking for unique email constraint before insert
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // findFirst used here: looking up tenant by name for registration
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
      },
    });

    const payload = { sub: user.id, email: user.email, tenantId: tenant.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: { id: string; email: string; name: string } }> {
    // findFirst used here: looking up user by unique email for authentication
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

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
