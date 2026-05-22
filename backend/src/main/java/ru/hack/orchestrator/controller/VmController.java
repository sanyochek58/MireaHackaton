package ru.hack.orchestrator.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ru.hack.orchestrator.domain.VmInstance;
import ru.hack.orchestrator.dto.request.CreateVmRequest;
import ru.hack.orchestrator.dto.response.AdminVmResponse;
import ru.hack.orchestrator.dto.response.VmResponse;
import ru.hack.orchestrator.security.AppUser;
import ru.hack.orchestrator.service.CurrentUserService;
import ru.hack.orchestrator.service.VmService;

import java.util.List;

@RestController
@RequestMapping("/api/vms")
@RequiredArgsConstructor
public class VmController {

    private final VmService vmService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VmResponse create(@Valid @RequestBody CreateVmRequest request) {
        AppUser user = currentUserService.currentUser();
        VmInstance vm = vmService.createVm(user, request);
        return toResponse(vm);
    }

    @GetMapping("/me")
    public VmResponse myVm() {
        AppUser user = currentUserService.currentUser();
        VmInstance vm = vmService.getMyVm(user);
        return toResponse(vm);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyVm() {
        AppUser user = currentUserService.currentUser();
        vmService.deleteMyVm(user);
    }

    @GetMapping("/admin/list")
    public List<AdminVmResponse> adminVms() {
        currentUserService.currentUser();
        return vmService.listAdminVms();
    }

    private VmResponse toResponse(VmInstance vm) {
        return new VmResponse(
                vm.serverId(),
                vm.volumeId(),
                vm.name(),
                vm.keyName(),
                vm.status(),
                vm.ipAddress(),
                vm.createdAt()
        );
    }
}
