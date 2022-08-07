import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ChatPageComponent } from './chat-page.component';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { UserMockService } from '../test/user-mock.service';
import { HubService } from '../hub.service';
import { HubMockService } from '../test/hub-mock.service';
import { CommonHttpService } from '@galileo/common-libraries';
import { HttpMockService } from '../test/http-mock.service';

describe('ChatPageComponent', () => {
  let component: ChatPageComponent;
  let fixture: ComponentFixture<ChatPageComponent>;
 
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatPageComponent],
      providers: [{ provide: UserService, useClass: UserMockService },
        { provide: HubService, useClass: HubMockService },
        { provide: CommonHttpService, useClass: HttpMockService }],
      imports: [FormsModule]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  it('should add a message when appendLine is called', () => {
    // arrange
    component.messages = [];
 
    // act
    component.appendLine('test message', 'test user', 'test color');
 
    // assert
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].text).toBe('test message');
  });
 
  describe('ping function', () => {
    it('should always call appendLine with "ping"', () => {
      // arrange
      spyOn(component, 'appendLine');
 
      // act
      component.ping();
 
      // assert
      expect(component.appendLine).toHaveBeenCalledWith('ping', jasmine.anything(), jasmine.anything());
    });
 
    it('should append a green message if hub connects', fakeAsync(() => {
      // arrange
      spyOn(component.hubConnection, 'invoke').and.returnValue(Promise.resolve('good promise'));
      let expectedColor = 'green';
      component.messages = [];
 
      // act
      component.ping();
      flush();
 
      // assert
      let actualColor = component.messages[1].color;
      expect(actualColor).toBe(expectedColor);
    }));
 
    it('should append a red message if hub connection fails', fakeAsync(() => {
      // arrange
      spyOn(component.hubConnection, 'invoke').and.returnValue(Promise.reject('bad promise'));
      let expectedColor = 'red';
      component.messages = [];
 
      // act
      component.ping();
      flush();
 
      // assert
      let actualColor = component.messages[1].color;
      expect(actualColor).toBe(expectedColor);
    }));
  });
 
  it('should be able to send a new message', fakeAsync(() => {
    // arrange
    spyOn(component.hubConnection, 'invoke').and.returnValue(Promise.resolve('good promise'));
    component.messages = [];
 
    // act
    component.sendMessage();
    flush();
 
    // assert
    expect(component.messages[0]).toBeUndefined();
  }));
});
 
 
 
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFlagExamplesComponent } from './feature-flag-examples.component';
import { UserService } from '../user.service';
import { UserMockService } from '../test/user-mock.service';
import { HttpMockService } from '../test/http-mock.service';
import { ClassExampleComponent } from '../feature-flag-examples/class-example/class-example.component';
import { MethodExampleComponent } from '../feature-flag-examples/method-example/method-example.component';
import { AccessorExampleComponent } from '../feature-flag-examples/accessor-example/accessor-example.component';
import { FormsModule } from '@angular/forms';
import { CommonFaultPoliciesService, CommonHttpService, CommonHttpModule } from '@galileo/common-libraries';
import { CommonFeatureFlagService } from '@galileo/common-feature-flag';
import { InitialValueService } from '../feature-flag-examples/initial-value.service';
import { Observable, of } from 'rxjs';

describe('FeatureFlagExamplesComponent', () => {
  let component: FeatureFlagExamplesComponent;
  let fixture: ComponentFixture<FeatureFlagExamplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureFlagExamplesComponent, ClassExampleComponent, MethodExampleComponent, AccessorExampleComponent],
      providers: [
        { provide: UserService, useClass: UserMockService },
        { provide: CommonHttpService, useClass: HttpMockService },
        CommonFeatureFlagService,
        InitialValueService, CommonFaultPoliciesService],
      imports: [FormsModule, CommonHttpModule]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureFlagExamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  it('should add an enabled flag when addClientFlag is called', () => {
    // arrange
    component.flag = 'test flag';
    let expectedLength = 1;
 
    // act
    component.addClientFlag();
    let actualLength = component.allFlags.length;
 
    // assert
    expect(actualLength).toBe(expectedLength);
  });
 
  it('should remove an enabled flag when removeClientFlag is called', () => {
    // arrange
    let expectedLength = 0;
 
    // act
    component.removeClientFlag();
    let actualLength = component.allFlags.length;
 
    // assert
    expect(actualLength).toBe(expectedLength);
  });
 
  it('should add a server flag when addServerFlag is called', () => {
    // arrange
    spyOn(component['featureFlagService']['httpService'], 'post').and.returnValue(of([]));
    component.flag = 'test server flag';
 
    // act
    component.addServerFlag();
 
    // assert
    expect(component['featureFlagService']['httpService'].post).toHaveBeenCalledWith('api/commonfeatureflag/v1/addenabled', jasmine.any(Object), jasmine.any(Object));
  });
 
  it('should remove a server flag when removeServerFlag is called', () => {
    // arrange
    spyOn(component['featureFlagService']['httpService'], 'post').and.returnValue(of([]));
    component.flag = 'test server flag';
 
    // act
    component['featureFlagService'].enabledFlags.push('test server flag');
    component.removeServerFlag();
 
    // assert
    expect(component['featureFlagService']['httpService'].post).toHaveBeenCalledWith('api/commonfeatureflag/v1/remove', jasmine.any(Object), jasmine.any(Object));
  });
});
 
 

 
import {throwError as observableThrowError,  of ,  Observable } from 'rxjs';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourcesPageFeaturesComponent, ResourcesPageComponent } from './resources-page.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Response, ResponseOptions } from '@angular/http';
import {
  CommonFaultPoliciesService,
  CommonHttpModule,
  CommonHttpService,
  BaseResultResponse,
  BaseErrorResponse } from '@galileo/common-libraries';
import { HttpErrorResponse } from '@angular/common/http';
import * as jsc from 'jsverify';
import { ResourceDtoV1 } from '@galileo/resource';
import { CommonFeatureFlagService } from '@galileo/common-feature-flag';
import { HttpMockService } from '../test/http-mock.service';
 
describe('ResourcesPageComponent', () => {
  // tslint:disable-next-line:prefer-const
  let component: ResourcesPageFeaturesComponent;
  // tslint:disable-next-line:prefer-const
  let fixture: ComponentFixture<ResourcesPageFeaturesComponent>;
 
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [CommonFeatureFlagService, CommonFaultPoliciesService,
        { provide: CommonHttpService, useClass: HttpMockService }],
      declarations: [ResourcesPageFeaturesComponent],
      imports: [
        FormsModule,
        CommonHttpModule,
        ReactiveFormsModule]
    }).compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesPageFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
 
describe('ResourcesPageComponent', () => {
  // tslint:disable-next-line:prefer-const
  let component: ResourcesPageFeaturesComponent = null;
  const mockHttpService: any = jasmine.createSpyObj(['get', 'delete', 'post', 'patch']);
  const mockFormBuilder: any = jasmine.createSpyObj(['group']);
  const controlsConfigArb = jsc.record({
    id: jsc.string,
    tenantId: jsc.string,
    name: jsc.string,
    type: jsc.string,
    description: jsc.string
  });
  const resourceRecordArb = jsc.record({
    id: jsc.string,
    tenantId: jsc.string,
    name: jsc.string,
    type: jsc.string,
    description: jsc.string,
    personnelIds: jsc.array(jsc.string),
    tags: jsc.array(jsc.string),
    location: jsc.string,
    latitude: jsc.number,
    longitude: jsc.number,
    altitude: jsc.number,
    notificationTags: jsc.array(jsc.string),
    notificationAddress: jsc.string
  });

  const resourceDtoV1Gen = resourceRecordArb.generator.map(rec => {
    const dto = new ResourceDtoV1();
    dto.id = rec.id;
    dto.tenantId = rec.id;
    dto.name = rec.name;
    dto.type = rec.type;
    dto.description = rec.description;
    dto.personnelIds = rec.personnelIds;
    dto.tags = rec.tags;
    dto.location = rec.location;
    dto.latitude = rec.latitude;
    dto.longitude = rec.longitude;
    dto.altitude = rec.altitude;
    dto.notificationTags = rec.notificationTags;
    dto.notificationAddress = rec.notificationAddress;
    return dto;
  });

  const resourceDtoV1Arb = jsc.bless({ generator: resourceDtoV1Gen });
  const messagesArb = jsc.array(jsc.string);
  const statusCodeArb = jsc.integer;
  const errorsArb = jsc.record({
    fieldName: jsc.string,
    errors: jsc.array(jsc.string)
  });

  const errorsStringGen = errorsArb.generator.map(err => JSON.stringify(err));
  const errorsStringArb = jsc.bless({ generator: errorsStringGen});
  const baseErrorResponseRecordArb = jsc.record({
    errors: jsc.array(errorsStringArb),
    errorId: jsc.string,
    statusCode: jsc.number
  });

  const baseErrorResponseGen = baseErrorResponseRecordArb.generator.map(rec => {
    const ber = new BaseErrorResponse();
    ber.errors = rec.errors;
    ber.errorId = rec.errorId;
    ber.statusCode = rec.statusCode;
    return ber;
  });

  const baseErrorResponseArb = jsc.bless({ generator: baseErrorResponseGen });
 
  beforeEach(() => {
    mockFormBuilder.group.calls.reset();
    mockHttpService.get.and.returnValue(of([]));
    component = new ResourcesPageComponent(mockHttpService, mockFormBuilder);
    component.clearForm();
  });

  it('should create and clear form', () => {
    // Assert
    expect(component).toBeTruthy();
    expect(component.errors).length === 0;
    expect(component.resource.id).toBeNull();
    expect(component.resource.tenantId).toBeNull();
    expect(component.resource.name).toBeNull();
    expect(component.resource.type).toBeNull();
    expect(component.resource.description).toBeNull();
    expect(component.resource.personnelIds).length === 0;
    expect(component.resource.tags).length === 0;
    expect(component.resource.location).toBeNull();
    expect(component.resource.latitude).toBeFalsy();
    expect(component.resource.longitude).toBeFalsy();
    expect(component.resource.altitude).toBeFalsy();
    expect(component.resource.notificationTags).length === 0;
    expect(component.resource.notificationAddress).toBeNull();
    expect(mockFormBuilder.group).toHaveBeenCalledTimes(1);
  });

  it('should set the resource properties from the form properties when setResource is called', () => {
    jsc.assertForall(controlsConfigArb, (cfg: any) => {
      // Arrange
      component.resourceForm = new FormBuilder().group(cfg);
 
      // Act
      component.setResource();
 
      // Assert
      return resourceMatchesControlConfig(component.resource, cfg);
    });
  });

  it('should set the form properties from the resource properties when setResourceForm is called', () => {
    jsc.assertForall(resourceDtoV1Arb, controlsConfigArb, ((dto, cfg) => {
      // Arrange
      component.resourceForm = new FormBuilder().group(cfg);
      component.resource = dto;
 
      // Act
      component.setResourceForm();
 
      // Assert
      return resourceFormMatchesDto(component.resourceForm, dto);
    }));
  });
 
  it('should set the form properties from the resource properties returned by retrieveResource', () => {
    jsc.assertForall(
      resourceDtoV1Arb,
      controlsConfigArb,
      messagesArb,
      statusCodeArb,
      ((dto, cfg, msgs, statusCode) => {
        // Arrange
        component.resourceForm = new FormBuilder().group(cfg);
        const baseResultResponse = new BaseResultResponse();
        baseResultResponse.statusCode = statusCode;
        baseResultResponse.messages = msgs;
        baseResultResponse.result = dto;
        mockHttpService.get.and.returnValue(of(baseResultResponse));
        mockHttpService.get.calls.reset();
 
        // Act
        component.retrieveResource();
 
        // Assert
        expect(mockHttpService.get).toHaveBeenCalledWith('api/resource/v1/' + cfg.id);
        expect(mockHttpService.get).toHaveBeenCalledTimes(1);
        return resourceFormMatchesDto(component.resourceForm, dto);
      }));
  });

  it('should set the form properties from the resource properties returned by retrieveResourceById', () => {
    jsc.assertForall(
      resourceDtoV1Arb,
      controlsConfigArb,
      messagesArb,
      statusCodeArb,
      ((dto, cfg, msgs, statusCode) => {
        // Arrange
        component.resourceForm = new FormBuilder().group(cfg);
        const baseResultResponse = new BaseResultResponse();
        baseResultResponse.statusCode = statusCode;
        baseResultResponse.messages = msgs;
        baseResultResponse.result = dto;
        mockHttpService.get.and.returnValue(of(baseResultResponse));
        mockHttpService.get.calls.reset();
 
        // Act
        component.retrieveResourceById(dto.id);
 
        // Assert
        expect(mockHttpService.get).toHaveBeenCalledWith('api/resource/v1/' + dto.id);
        expect(mockHttpService.get).toHaveBeenCalledTimes(1);
        return resourceFormMatchesDto(component.resourceForm, dto);
      }));
  });

  it('should send a delete request to the REST api when deleteResource is called', () => {
    mockHttpService.delete.and.returnValue(of([]));
    jsc.assertForall(
      resourceDtoV1Arb,
      controlsConfigArb,
      ((dto, cfg) => {
        // Arrange
        component.resourceForm = new FormBuilder().group(cfg);
        mockHttpService.delete.calls.reset();
 
        // Act
        component.deleteResource();
 
        // Assert
        expect(mockHttpService.delete).toHaveBeenCalledTimes(1);
        return true;
      }));
  });

  it('should not change the resource if the resource form is invalid when createResource is called', () => {
    jsc.assertForall(controlsConfigArb, ResourceDtoV1, (cfg: any, dto) => {
      // Arrange
      component.resource = dto;
      component.resourceForm = new FormBuilder().group(cfg);
      component.resourceForm.setErrors({ 'some_error': true });

      // Act
      component.createResource();

      // Assert
      expect(component.resource === dto && !component.resourceForm.valid).toBeTruthy();
      return true;
    });
  });
 
  it('should set he original resource, resource, and resource form  to the return value createResource succeeds', () => {
      jsc.assertForall(
        resourceDtoV1Arb,
        resourceDtoV1Arb,
        resourceDtoV1Arb,
        controlsConfigArb,
        (resource, origResource, responseDto, cfg) => {
          // Arrange
          component.resource = resource;
          component.origResource = origResource;
          component.resourceForm = new FormBuilder().group(cfg);
          const baseResultResponse = new BaseResultResponse();
          baseResultResponse.result = responseDto;
          mockHttpService.post.and.returnValue(of(baseResultResponse));
          mockHttpService.post.calls.reset();
 
          // Act
          component.createResource();
 
          // Assert
          expect(mockHttpService.post).toHaveBeenCalledWith('api/resource/v1', resource);
          return resourceFormMatchesDto(component.resourceForm, responseDto)
            && resourcesMatch(component.resource, responseDto)
            && resourcesMatch(component.origResource, responseDto);
        });
    });
 
    it('shoud add errors messages to appropriate locations when createResource fails with status code of 400', () => {
      jsc.assertForall(
        resourceDtoV1Arb,
        resourceDtoV1Arb,
        baseErrorResponseArb,
        controlsConfigArb,
       (resource, origResource, errorResponse, cfg) => {
          // Arrange
          component.resource = resource;
          component.origResource = origResource;
          component.resourceForm = new FormBuilder().group(cfg);
          const descriptionError = {fieldName: 'description', errors: 'description_error' };
          errorResponse.errors.push(JSON.stringify(descriptionError));
          errorResponse.statusCode = 400;
          const httpErrorResponse = new HttpErrorResponse({error: errorResponse, status: errorResponse.statusCode});
          mockHttpService.post.and.returnValue(observableThrowError(httpErrorResponse));
          mockHttpService.post.calls.reset();
 
          // Act
          component.createResource();
 
          // Assert
          expect(mockHttpService.post).toHaveBeenCalledWith('api/resource/v1', resource);
          // tslint:disable-next-line:prefer-const
          let property = true;
          const errors = errorResponse.errors.map(err => JSON.parse(err));
          const keys = Object.keys(cfg);
          // tslint:disable-next-line:prefer-const
          for (let i = 0; i < errors.length; i++) {
            const error = errors[i];
            if (keys.includes(error.fieldName)) {
            // This will likely only happen for the description field because we specifically added an error for it
              property = property && component.resourceForm.controls[error.fieldName].errors !== null;
            } else {
              // tslint:disable-next-line:prefer-const
              for (let j = 0; j < error.errors.length; j++) {
                property = property && component.errors.includes(error.errors[j]);
              }
            }
         }
 
          return property;
        });
    });
 
  it('should add general error message when createResource fails with status code other than 400', () => {
        jsc.assertForall(
          resourceDtoV1Arb,
          resourceDtoV1Arb,
          baseErrorResponseArb,
          controlsConfigArb,
          (resource, origResource, errorResponse, cfg) => {
            // Arrange
            component.resource = resource;
            component.origResource = origResource;
            component.resourceForm = new FormBuilder().group(cfg);
            const httpErroResponse = new HttpErrorResponse({error: errorResponse, status: errorResponse.statusCode});
            mockHttpService.post.and.returnValue(observableThrowError(httpErrorResponse));
            mockHttpService.post.calls.reset();
 
            // Act
            component.createResource();
 
            // Assert
            expect(mockHttpService.post).toHaveBeenCalledWith('api/resource/v1', resource);
            return component.errors.includes('Something went wrong!');
          });
      });
 
  it('should submit a patch when updateResource is called', () => {
    jsc.assertForall(
      resourceDtoV1Arb,
      resourceDtoV1Arb,
      resourceDtoV1Arb,
      controlsConfigArb,
      ((resource, origResource, responseDto, cfg) => {
        // Arrange
        component.resource = resource;
        component.origResource = origResource;
        component.resourceForm = new FormBuilder().group(cfg);
        const baseResultResponse = new BaseResultResponse();
        baseResultResponse.result = responseDto;
        mockHttpService.patch.and.returnValue(of(baseResultResponse));
        mockHttpService.patch.calls.reset();
 
        // Act
        component.updateResource();
 
        // Assert
        exect(mockHttpService.patch).toHaveBeenCalledWith('api/resource/v1/' + resource.id, origResource, resource);
        return resourceFormMatchesDto(component.resourceForm, responseDto)
          && resourcesMatch(component.resource, responseDto)
          && resourcesMatch(component.origResource, responseDto);
      }));
  });
 
  it('should set the allResources property to the value returned by refreshAllResources', () => {
    jsc.assertForall(
      jsc.array(resourceDtoV1Arb),
      controlsConfigArb,
      ((dtos, cfg) => {
        // Arrange
        component.resourceForm = new FormBuilder().group(cfg);
        const baseResultResponse = new BaseResultResponse();
        baseResultResponse.result = dtos;
        mockHttpService.get.and.returnValue(of(baseResultResponse));
        mockHttpService.get.calls.reset();
 
        // Act
        component.refreshAllResources();
 
        // Assert
        expect(mockHttpService.get).toHaveBeenCalledWith('api/resource/v1/all');
        expect(mockHttpService.get).toHaveBeenCalledTimes(1);
        return component.allResources === dtos;
      }));
  });
 
  it('should add a tag to the resource when addTag is called', () => {
    jsc.assertForall(controlsConfigArb, jsc.string, (cfg: any, tag) => {
      // Arrange
      component.resourceForm = new FormBuilder().group(cfg);
      component.newTag = tag;
 
      // Act
      component.addTag();
 
      // Assert
      if (tag) {
        return component.resource.tags.includes(tag)
          && component.newTag === null
          && component.resourceForm.dirty;
      } else {
        // Our code treats this case as a no-op
        return true;
      }
    });
  });
 
  it('should remove a tag from the resource when removeTag is called', () => {
    jsc.assertForall(controlsConfigArb, jsc.number, (cfg: any, index) => {
      // Arrange
      component.resourceForm = new FormBuilder().group(cfg);
      const arrayLength = Math.random() < 0.5 ? Math.max(0, index - 1) : Math.max(0, index + index);
      const tags = createRandomArray(arrayLength);
      const tagAfterRemovedTag = index >= 0 && index < tags.length ? tags[index + 1] : null;
      component.resource.tags = tags;
 
      // Act
      component.removeTag(index);
 
      // Assert
      if (tagAfterRemovedTag) {
        return component.resource.tags[index] === tagAfterRemovedTag
          && component.resourceForm.dirty;
      } else {
        // Our code treats this case as a no-op
        return true;
      }
    });
  });
});
 
function createRandomArray(size: number) {
  const result: string[] = [];
  // tslint:disable-next-line:prefer-const
  for (let i = 0; i < size; i++) {
    result[i] = Math.random() + '';
  }
 
  return result;
}
 
function resourceMatchesControlConfig(resource: ResourceDtoV1, cfg: any): boolean {
  return resource.id === cfg.id
    && resource.tenantId === cfg.tenantId
    && resource.name === cfg.name
    && resource.type === cfg.type
    && resource.description === cfg.description;
}
 
function resourceFormMatchesDto(resourceForm: FormGroup, dto: ResourceDtoV1): boolean {
  return resourceForm.get('id').value === dto.id
    && resourceForm.get('tenantId').value === dto.tenantId
    && resourceForm.get('name').value === dto.name
    && resourceForm.get('type').value === dto.type
    && resourceForm.get('description').value === dto.description;
}

function resourcesMatch(first: ResourceDtoV1, second: ResourceDtoV1) {
  return JSON.stringify(first) === JSON.stringify(second);
}