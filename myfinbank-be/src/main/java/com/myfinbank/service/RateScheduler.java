package com.myfinbank.service;

import com.myfinbank.entity.RateCalcolate;
import com.myfinbank.repository.RateCalcolateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RateScheduler {

    private final RateCalcolateRepository rateCalcolateRepository;

    @Scheduled(cron = "0 */5 * * * *") // ogni 5 minuti
    @Transactional
    public void aggiornaStatoRate() {
        LocalDateTime now = LocalDateTime.now();

        List<RateCalcolate> daPagare = rateCalcolateRepository.findByStatoRata("DA_PAGARE");

        for (RateCalcolate rata : daPagare) {
            if (rata.getScadenza().isBefore(now)) {
                rata.setStatoRata("SCADUTO");
                rateCalcolateRepository.save(rata);
            }
        }
    }
}
