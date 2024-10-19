import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { User } from './entities/user.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserResponse } from './dto/create-response-user.dto';

@ApiTags('api/users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create User' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    type: CreateUserResponse,
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser({ ...createUserDto });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(@Req() { user }: { user: User }) {
    return this.usersService.findById(user.id);
  }

  @Get('/:userName')
  async find(@Param('userName') userName: string) {
    console.log(userName);
    const user = await this.usersService.findOneByUserName(
      decodeURIComponent(userName),
    );
    return user;
  }
}
