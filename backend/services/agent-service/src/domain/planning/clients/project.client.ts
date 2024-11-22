import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Project } from '@coworker/shared';

@Injectable()
export class ProjectServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('PROJECT_SERVICE_URL', 'http://localhost:3001');
  }

  async getProject(projectId: string): Promise<Project> {
    const { data } = await firstValueFrom(
      this.httpService.get<Project>(`${this.baseUrl}/projects/${projectId}`)
    );
    return data;
  }

  async validateProject(projectId: string): Promise<boolean> {
    try {
      await this.getProject(projectId);
      return true;
    } catch (error) {
      return false;
    }
  }
}
