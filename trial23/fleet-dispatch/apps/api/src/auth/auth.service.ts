// TRACED: FD-AUTH-001 — Password hashing with bcryptjs (BCRYPT_SALT_ROUNDS from @repo/shared)
// TRACED: FD-DATA-005 — User lookup by email uses unique index
// TRACED: FD-EDGE-001 — Duplicate email registration returns 409
// TRACED: FD-EDGE-007 — Login with wrong password returns 401 (no timing leak info)
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infra/prisma.service';
import { hashPassword, comparePassword } from '../common/auth-utils';
import { ALLOWED_REGISTRATION_ROLES } from '@repo/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ id: string; email: string; role: string }> {
    if (!ALLOWED_REGISTRATION_ROLES.includes(dto.role as (typeof ALLOWED_REGISTRATION_ROLES)[number])) {
      throw new ConflictException('Role not allowed for registration');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
        companyId: dto.companyId,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await comparePassword(dto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; name: string; role: string; companyId: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, companyId: true },
    });

    return user;
  }
}
