import { Component, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild, QueryList, ViewChildren, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import Overlay from 'ol/Overlay';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HomeOfficeService, Location } from '../../services/home-office/home-office.service';
import { ThemeService } from '../../services/theme-service/theme-service.service';
import {ProgressSpinnerMode, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { GenericPopupComponent, PopupField } from '../../components/popup/popup/popup.component';
import { Subscription } from 'rxjs';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-home-office-map',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    CommonModule,
    MatProgressSpinnerModule,
    DragDropModule
  ],
  templateUrl: './home-office-page.component.html',
  styleUrls: ['./home-office-page.component.scss']
})
export class HomeOfficeMapComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('tooltip') tooltipElement!: ElementRef;
  @ViewChildren('addressElement') addressElements!: QueryList<ElementRef>;

  private map!: Map;
  private vectorSource!: VectorSource;
  private overlay!: Overlay;
  private tileLayer!: TileLayer<any>;
  private markersMap: { [key: number]: Feature } = {};
  private tempMarker: Feature | null = null;

  addingByMap: boolean = false;
  confirmingAddress: boolean = false;
  nextId: number = 0;
  addressInput: string = '';
  searchAddress: string = '';
  currentAddress: string = '';
  pendingLocation: Partial<Location> | null = null;
  newOfficeDescription: string = '';
  newOfficeName: string = '';
  isOverflowing: boolean = true;
  loading = false;
  
  isDarkMode: boolean = false;

  locations: Location[] = [];
  private officeSubscription: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private homeOfficeService: HomeOfficeService,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.officeSubscription.add(
        this.homeOfficeService.offices$.subscribe(locations => {
          this.locations = locations;
          this.nextId = this.locations.reduce((max, loc) => Math.max(max, loc.id), 0) + 1;
          if (this.map && this.vectorSource) {
            this.updateMarkers();
          }
        })
      );
      
      this.officeSubscription.add(
        this.themeService.isDarkTheme$.subscribe(isDark => {
          this.isDarkMode = isDark;
        })
      );
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {

      this.initMap();

      this.officeSubscription.add(
        this.themeService.isDarkTheme$.subscribe(isDark => {
          this.loading = true;
          this.updateMapTheme(isDark);
        })
      );

      this.addressElements.changes.subscribe(() => {
        this.addressElements.forEach((el: ElementRef) => {
          if (el.nativeElement.scrollWidth > el.nativeElement.clientWidth) {
            el.nativeElement.classList.add('marquee');
          } else {
            el.nativeElement.classList.remove('marquee');
          }
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.officeSubscription.unsubscribe();
    if (this.map) {
      this.map.setTarget(undefined);
    }
  }

  private initMap(): void {
    this.tileLayer = new TileLayer({
      source: new OSM({
        attributions: ''
      })
    });

    this.vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });

    this.map = new Map({
      target: 'map',
      layers: [this.tileLayer, vectorLayer],
      view: new View({
        center: fromLonLat([-74.006, 40.7128]),
        zoom: 4
      })
    });

    this.map.once('rendercomplete', () => {
      this.loading = false;
    });

    const tooltip = document.getElementById('tooltip') as HTMLElement;
    this.overlay = new Overlay({
      element: tooltip,
      offset: [10, 0],
      positioning: 'bottom-left'
    });
    this.map.addOverlay(this.overlay);

    this.map.on('pointermove', evt => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, feature => feature);
      if (feature && feature.get('description')) {
        const coordinate = evt.coordinate;
        tooltip.innerHTML = feature.get('description');
        this.overlay.setPosition(coordinate);
        tooltip.style.display = 'block';
      } else {
        tooltip.style.display = 'none';
      }
    });

    this.map.on('click', evt => {
      if (this.addingByMap || this.confirmingAddress) {
        const clickedCoord = evt.coordinate;
        const [lon, lat] = toLonLat(clickedCoord);
        this.updateTempMarker(lat, lon);
        this.reverseGeocode(lat, lon).then(address => {
          this.currentAddress = address || `Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          if (this.addingByMap) {
            this.newOfficeName = this.currentAddress;
          }
          this.pendingLocation = { lat, lng: lon };
          this.confirmingAddress = true;
          this.addingByMap = false;
        }).catch(err => {
          console.error('Reverse geocoding failed', err);
          this.snackBar.open('Could not retrieve address for this location', 'Close', { duration: 3000 });
        });
      }
    });

    this.updateMarkers();
  }

  private updateMapTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    if (!this.tileLayer) return;

    const newSource = isDark
      ? new XYZ({
          url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          attributions: '',
        })
      : new OSM({
          attributions: ''
        });

    this.tileLayer.setSource(newSource);

    const newPinUrl = isDark ? 'assets/dark_mode_pin.svg' : 'assets/pin.svg';
    
    if (this.tempMarker) {
      this.tempMarker.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          scale: 0.03,
          src: newPinUrl,
          color: isDark ? undefined : '#4285F4'
        })
      }));
    }

    Object.values(this.markersMap).forEach(marker => {
      marker.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          scale: 0.03,
          src: newPinUrl
        })
      }));
    });

    this.tileLayer.getSource()?.once('tileloadend', () => {
      this.loading = false;
    });
  }

  private updateTempMarker(lat: number, lon: number): void {
    if (this.tempMarker) {
      this.vectorSource.removeFeature(this.tempMarker);
    }
    const pinUrl = this.isDarkMode ? 'assets/dark_mode_pin.svg' : 'assets/pin.svg';
    this.tempMarker = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
      name: 'New Office',
      description: 'Pending office location',
      isTemporary: true
    });
    this.tempMarker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        scale: 0.03,
        src: pinUrl,
        color: this.isDarkMode ? undefined : '#4285F4'
      })
    }));
    this.vectorSource.addFeature(this.tempMarker);
  }

  createMarker(location: Location): void {
    const pinUrl = this.isDarkMode ? 'assets/dark_mode_pin.svg' : 'assets/pin.svg';
    const marker = new Feature({
      geometry: new Point(fromLonLat([location.lng, location.lat])),
      name: location.name,
      description: location.description,
      locationId: location.id
    });
    marker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        scale: 0.03,
        src: pinUrl
      })
    }));
    this.vectorSource.addFeature(marker);
    this.markersMap[location.id] = marker;
  }

  private updateMarkers(): void {
    if (!this.vectorSource || !this.map) return;
    this.vectorSource.clear();
    this.markersMap = {};
    this.locations.forEach(location => {
      this.createMarker(location);
    });
  }

  addLocation(location: Location): void {
    this.homeOfficeService.addOffice(location);
    this.snackBar.open('Office added successfully', 'Close', { duration: 3000 });
  }

  editLocation(location: Location): void {
    const fields: PopupField[] = [
      { name: 'name', label: 'Office Name', type: 'text', validators: [] },
      { name: 'description', label: 'Description', type: 'text', validators: [] }
    ];
  
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: {
        fields: fields,
        values: {
          name: location.name,
          description: location.description
        },
      },
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedLocation: Location = {
          ...location,
          name: result.name,
          description: result.description
        };
        
        this.homeOfficeService.updateOffice(updatedLocation);
        
        
        this.snackBar.open('Office updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteLocation(location: Location): void {
    this.homeOfficeService.deleteOffice(location.id);
  }
  forwardGeocode(address: string): Promise<{ lat: number, lon: number }> {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}`;
    return fetch(url)
      .then(response => response.json())
      .then((data: any) => {
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
        throw new Error('No results found');
      });  }

  reverseGeocode(lat: number, lon: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    return fetch(url)
      .then(response => response.json())
      .then(data => data.display_name);
  }

  searchAddressByInput(): void {
    if (this.addressInput.trim()) {
      this.forwardGeocode(this.addressInput.trim())
        .then(coords => {
          this.map.getView().setCenter(fromLonLat([coords.lon, coords.lat]));
          this.map.getView().setZoom(14);
          this.updateTempMarker(coords.lat, coords.lon);
          this.pendingLocation = { lat: coords.lat, lng: coords.lon };
          this.newOfficeName = this.addressInput;
          this.currentAddress = this.addressInput;
          this.confirmingAddress = true;
        })
        .catch(err => {
          console.error('Forward geocoding failed', err);
          this.snackBar.open('Address not found', 'Close', { duration: 3000 });
        });
    }
  }

  searchAddressOnMap(): void {
    if (!this.searchAddress.trim()) {
      return;
    }
    
    this.loading = true;
    this.geocodeAddress(this.searchAddress).then(result => {
      if (result) {
        const { lat, lng, address } = result;
        this.updateTempMarker(lat, lng);
        this.currentAddress = address;
        this.newOfficeName = address;
        this.pendingLocation = { lat, lng };
        this.confirmingAddress = true;
        
        this.map.getView().animate({
          center: fromLonLat([lng, lat]),
          zoom: 15,
          duration: 1000
        });
      } else {
        this.snackBar.open('Address not found', 'Close', { duration: 3000 });
      }
      this.loading = false;
    }).catch(err => {
      console.error('Geocoding failed', err);
      this.snackBar.open('Failed to find address', 'Close', { duration: 3000 });
      this.loading = false;
    });
  }
  onPinDropped(event: CdkDragEnd): void {
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    
    const mapContainer = document.querySelector('.map-container') as HTMLElement;
    const mapRect = mapContainer.getBoundingClientRect();
    
    if (
      rect.left >= mapRect.left && 
      rect.right <= mapRect.right &&
      rect.top >= mapRect.top &&
      rect.bottom <= mapRect.bottom
    ) {
      const pixelCoords = [
        rect.left + rect.width / 2 - mapRect.left,
        rect.top + rect.height / 2 - mapRect.top
      ];
      
      const coordinate = this.map.getEventCoordinate({
        clientX: mapRect.left + pixelCoords[0],
        clientY: mapRect.top + pixelCoords[1]
      } as MouseEvent);
      
      const [lon, lat] = toLonLat(coordinate);
      
      this.updateTempMarker(lat, lon);
      this.reverseGeocode(lat, lon).then(address => {
        this.currentAddress = address || `Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        this.newOfficeName = this.currentAddress;
        this.pendingLocation = { lat, lng: lon };
        this.confirmingAddress = true;
      }).catch(err => {
        console.error('Reverse geocoding failed', err);
        this.snackBar.open('Failed to get address information', 'Close', { duration: 3000 });
      });
    }
    
    event.source._dragRef.reset();
    element.style.transform = 'translate3d(0px, 0px, 0px)';
  }

  confirmAddOffice(): void {
    if (this.pendingLocation && this.newOfficeName) {
      const newOffice: Omit<Location, 'id'> = {
        name: this.newOfficeName,
        lat: this.pendingLocation.lat!,
        lng: this.pendingLocation.lng!,
        description: this.newOfficeDescription || ''
      };
      this.homeOfficeService.addOffice(newOffice);
      this.resetAddressForm();
    }
  }

  cancelAddOffice(): void {
    this.resetAddressForm();
  }

  focusOnLocation(location: Location): void {
    if (this.map && location) {
      this.map.getView().setCenter(fromLonLat([location.lng, location.lat]));
      
      this.map.getView().setZoom(15);
      
      this.snackBar.open(`Looking at ${location.name}`, 'Close', { 
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  private resetAddressForm(): void {
    if (this.tempMarker) {
      this.vectorSource.removeFeature(this.tempMarker);
      this.tempMarker = null;
    }
    this.confirmingAddress = false;
    this.addingByMap = false;
    this.pendingLocation = null;
    this.addressInput = '';
    this.newOfficeName = '';
    this.newOfficeDescription = '';
    this.currentAddress = '';
  }

  private geocodeAddress(address: string): Promise<{ lat: number; lng: number; address: string } | null> {
    return new Promise((resolve, reject) => {
      
      setTimeout(() => {
        const mockGeocodingResults: { [key: string]: { lat: number; lng: number } } = {
          'new york': { lat: 40.7128, lng: -74.006 },
          'los angeles': { lat: 34.0522, lng: -118.2437 },
          'chicago': { lat: 41.8781, lng: -87.6298 },
          'san francisco': { lat: 37.7749, lng: -122.4194 },
          'miami': { lat: 25.7617, lng: -80.1918 },
        };
        
        const lowerCaseAddress = address.toLowerCase();
        
        const exactMatch = mockGeocodingResults[lowerCaseAddress];
        if (exactMatch) {
          resolve({
            lat: exactMatch.lat,
            lng: exactMatch.lng,
            address: address
          });
          return;
        }
          for (const key of Object.keys(mockGeocodingResults)) {
          if (lowerCaseAddress.includes(key) || key.includes(lowerCaseAddress)) {
            resolve({
              lat: mockGeocodingResults[key].lat,
              lng: mockGeocodingResults[key].lng,
              address: address // Return the original address instead of the key
            });
            return;
          }
        }
        
        const randomLat = 40 + (Math.random() - 0.5) * 10;
        const randomLng = -100 + (Math.random() - 0.5) * 50;
        
        resolve({
          lat: randomLat,
          lng: randomLng,
          address: address
        });
      }, 1000);
    });
  }
}
